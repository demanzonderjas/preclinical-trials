<?php

namespace App\Http\Controllers\Pages\Workspace;

use App\Http\Controllers\Controller;
use App\Mail\EmbargoExtensionRequested;
use App\Models\ActivityLog;
use App\Models\EmbargoExtension;
use App\Models\Protocol;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

/** Asking the PCT team for one more year of embargo. */
class EmbargoController extends Controller
{
    public function show(Request $request, int $id): Response|RedirectResponse
    {
        $protocol = $this->embargoed($request, $id);
        if (! $protocol) {
            return redirect()->route('workspace.protocols')->with('error', 'Only published protocols under embargo can be extended.');
        }
        $ends = Carbon::parse($protocol->embargo_end_date)->startOfDay();
        $pending = $protocol->embargoExtensions->firstWhere('status', 'awaiting_approval');

        return Inertia::render('workspace/extend-embargo', [
            'protocol' => [
                'id' => $protocol->id,
                'pct_id' => $protocol->pct_id,
                'title' => $protocol->title,
                'ends' => $ends->toDateString(),
                'days_left' => (int) now()->startOfDay()->diffInDays($ends, false),
                'extensions' => $protocol->embargoExtensions->where('status', 'approved')->count(),
            ],
            'pending' => $pending ? ['at' => $pending->created_at->toIso8601String(), 'reason' => $pending->reason] : null,
        ]);
    }

    public function store(Request $request, int $id): RedirectResponse
    {
        $protocol = $this->embargoed($request, $id);
        abort_unless($protocol, 409, 'Only published protocols under embargo can be extended.');
        abort_if($protocol->embargoExtensions->contains('status', 'awaiting_approval'), 409, 'An extension is already requested.');
        $data = $request->validate([
            'confirm' => ['accepted'],
            'reason' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        $extension = $protocol->embargoExtensions()->save(new EmbargoExtension(['reason' => $data['reason']]));
        ActivityLog::record($protocol, 'extension_requested', [], $request->user());
        Mail::to(config('pct.admin_mail'))->send(new EmbargoExtensionRequested($extension));

        return redirect()->route('workspace.protocols')->with('success', 'Your request was sent. You receive an email as soon as the PCT team has decided; this may take a few days.');
    }

    private function embargoed(Request $request, int $id): ?Protocol
    {
        $protocol = Protocol::with('details', 'embargoEndDates', 'embargoExtensions')->findOrFail($id);
        abort_unless($protocol->user_id === $request->user()->id, 403);

        return $protocol->status === 'published' && $protocol->has_embargo && $protocol->embargo_end_date ? $protocol : null;
    }
}
