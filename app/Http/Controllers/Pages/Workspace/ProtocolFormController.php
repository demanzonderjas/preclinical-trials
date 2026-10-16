<?php

namespace App\Http\Controllers\Pages\Workspace;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\FeedbackPoint;
use App\Models\Protocol;
use App\Models\User;
use App\Services\Import\ProtocolImporter;
use App\Services\ProtocolImages;
use App\Services\ProtocolSchema;
use App\Services\ProtocolWorkflow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The A2 protocol form: seven steps, saved automatically while a protocol is a draft or
 * returned with feedback (F5). Published protocols are changed through an amendment, which
 * is saved in one go with its reason.
 */
class ProtocolFormController extends Controller
{
    private const EDITABLE = ['draft', 'rejected'];

    public function create(Request $request): Response
    {
        return $this->render($request, null, $this->defaults($request->user()));
    }

    public function edit(Request $request, int $id): Response|RedirectResponse
    {
        $protocol = $this->owned($request, $id);
        if (! in_array($protocol->status, [...self::EDITABLE, 'published'], true)) {
            return redirect("/database/view-protocol/{$protocol->id}")->with('error', 'This protocol is locked while the PCT team reviews it.');
        }

        // Protocols from before A2 have no choice stored and always showed the name.
        return $this->render($request, $protocol, $protocol->values() + ['publish_name' => $protocol->publishes_name]);
    }

    /** The first autosave of a new protocol creates the draft. */
    public function store(Request $request): JsonResponse
    {
        $values = $this->validated($request);

        $protocol = DB::transaction(function () use ($request, $values) {
            $protocol = $request->user()->protocols()->create(['status' => 'draft']);
            $protocol->addDetailsToDatabase($values + $this->defaults($request->user()));
            ActivityLog::record($protocol, 'draft_created', [], $request->user());

            return $protocol;
        });

        return $this->saved($protocol->fresh('details'), 201);
    }

    /** Autosave: the answers that changed since the last save. */
    public function update(Request $request, ProtocolWorkflow $workflow, int $id): JsonResponse
    {
        $protocol = $this->owned($request, $id);
        abort_unless(in_array($protocol->status, self::EDITABLE, true), 409, 'Only drafts and returned protocols save automatically.');
        $values = $this->validated($request);

        $changed = $protocol->changedKeys($values);
        $protocol->addDetailsToDatabase($values);
        $workflow->markAddressed($protocol, $changed);
        $protocol->touch();

        return $this->saved($protocol->fresh('details'));
    }

    /**
     * Changes to a published protocol: recorded as a version with the reason (audit trail)
     * and sent to the PCT team, as in the legacy form.
     */
    public function amend(Request $request, ProtocolWorkflow $workflow, int $id): RedirectResponse
    {
        $protocol = $this->owned($request, $id);
        abort_unless($protocol->status === 'published', 409, 'Only published protocols are amended.');
        $values = $this->validated($request);
        $reason = $request->validate(['why_amendment' => ['nullable', 'string', 'max:5000']])['why_amendment'] ?? null;

        $changed = array_values(array_diff($protocol->changedKeys($values), ['why_amendment']));
        if (! $changed) {
            return back()->with('error', 'Nothing changed, so there is no amendment to record.');
        }
        if (! trim((string) $reason)) {
            return back()->withErrors(['why_amendment' => 'Describe why you amend the published protocol.']);
        }

        $protocol->saveRevisions([...$values, 'why_amendment' => $reason]);
        ActivityLog::record($protocol, 'amended', ['fields' => $changed], $request->user());
        $workflow->submit($protocol, $request->user(), $reason);

        return redirect("/database/view-protocol/{$protocol->id}")->with('success', 'Your amendment is recorded in the protocol’s history and sent to the PCT team.');
    }

    public function uploadImage(Request $request, int $id): JsonResponse
    {
        $protocol = $this->owned($request, $id);
        abort_unless(in_array($protocol->status, [...self::EDITABLE, 'published'], true), 409);
        $request->validate(ProtocolImages::RULES);

        return response()->json(['filename' => ProtocolImages::store($request, $request->file('image'))]);
    }

    public function import(Request $request, ProtocolImporter $importer): RedirectResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:5120', 'mimetypes:application/json,text/plain,text/xml,application/xml']]);

        try {
            $result = $importer->import($request->user(), $request->file('file'), $this->defaults($request->user()));
        } catch (\InvalidArgumentException|\JsonException) {
            return back()->withErrors(['file' => 'This is not a PRIS (.json) or APAFiS (.xml) export.']);
        }

        $message = "Imported from {$result['source']}. Check every answer: imports rarely fill the whole form.";
        if ($result['untranslated']) {
            $message .= " {$result['untranslated']} French answers could not be translated automatically.";
        }

        return redirect("/dashboard/edit-protocol/{$result['protocol']->id}")->with('success', $message);
    }

    private function render(Request $request, ?Protocol $protocol, array $values): Response
    {
        $user = $request->user();
        $points = $protocol?->status === 'rejected'
            ? $protocol->feedbackPoints()->whereIn('review_round_id', $protocol->reviewRounds()->latest('number')->limit(1)->pluck('id'))->get()
            : collect();

        return Inertia::render('workspace/protocol-form', [
            'protocol' => $protocol ? [
                'id' => $protocol->id,
                'status' => $protocol->status,
                'pct_id' => $protocol->status === 'published' ? $protocol->pct_id : null,
                'started_at' => $protocol->created_at->toIso8601String(),
                'saved_at' => $protocol->updated_at->toIso8601String(),
            ] : null,
            'values' => (object) $values,
            'feedback' => $points->map(fn (FeedbackPoint $point) => ['field_key' => $point->field_key, 'status' => $point->status, 'body' => $point->body])->values(),
            'countries' => collect(config('pct.countries'))->map(fn ($name, $code) => ['value' => $code, 'label' => $name])->values(),
            'profile' => ['name' => $user->name, 'role' => $user->role, 'email' => $user->email, 'institution' => $user->institution],
        ]);
    }

    /** A new protocol starts with the researcher's own details (F11: publish name per default). */
    private function defaults(User $user): array
    {
        return [
            'contact_name' => $user->name,
            'contact_role' => $user->role,
            'contact_email' => $user->email,
            'publish_name' => (bool) $user->publish_name_default,
            'study_centre' => [['name' => $user->institution, 'city' => $user->city, 'country' => $user->country]],
        ];
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate(['values' => ['required', 'array']]);

        return Protocol::getValidKeys($data['values']);
    }

    private function saved(Protocol $protocol, int $status = 200): JsonResponse
    {
        return response()->json([
            'id' => $protocol->id,
            'saved_at' => $protocol->updated_at->toIso8601String(),
            'progress' => ProtocolSchema::progress($protocol->values()),
        ], $status);
    }

    private function owned(Request $request, int $id): Protocol
    {
        $protocol = Protocol::with('details')->findOrFail($id);
        abort_unless($protocol->user_id === $request->user()->id, 403);

        return $protocol;
    }
}
