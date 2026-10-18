<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Detail;
use App\Models\Protocol;
use App\Services\ProtocolSchema;
use App\Services\PublicRegister;
use App\Support\Html;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * F4: a time-stamped PDF of a protocol, and the registration certificate of a published one.
 */
class ProtocolPdfController extends Controller
{
    /** Same access as the protocol page; owners and admins also get drafts and contact details. */
    public function protocol(Request $request, int $id): Response
    {
        $protocol = Protocol::with('details', 'adminActions', 'embargoEndDates', 'revisions')->findOrFail($id);
        $privileged = $this->privileged($request, $protocol);
        abort_if(($protocol->has_embargo || $protocol->status !== 'published') && ! $privileged, 403, 'This protocol is not public.');

        $private = $privileged ? [] : ['contact_email', 'contact_role', 'publish_name', ...($protocol->publishes_name ? [] : ['contact_name'])];
        $values = $protocol->details
            ->reject(fn (Detail $detail) => in_array($detail->key, $private, true))
            ->mapWithKeys(fn (Detail $detail) => [$detail->key => $detail->value])
            ->all();

        $sections = collect([
            ['title' => 'General', 'fields' => $this->rows('general', $values)],
            ['title' => 'Study design', 'groups' => collect(ProtocolSchema::designGroups())
                ->map(fn ($title, $group) => ['title' => $title, 'fields' => $this->rows('design', $values, $group)])
                ->filter(fn ($group) => $group['fields'])->values()->all()],
            ['title' => 'Contact', 'fields' => $this->rows('contact', $values, null, $privileged, $private)],
        ]);

        $pdf = Pdf::loadView('pdf.protocol', [
            ...$this->record($protocol),
            'sections' => $sections,
            'amendments' => $protocol->revisions->where('admin_only', false)->count(),
            'generated' => $this->now(),
        ]);

        return $pdf->download($this->filename($protocol, 'protocol'));
    }

    public function certificate(Request $request, int $id): Response
    {
        $protocol = Protocol::with('details', 'adminActions', 'embargoEndDates')->findOrFail($id);
        abort_unless($this->privileged($request, $protocol), 403);
        abort_unless($protocol->status === 'published' && $protocol->registration_date, 404, 'Only registered protocols have a certificate.');

        $pdf = Pdf::loadView('pdf.certificate', [...$this->record($protocol), 'generated' => $this->now()]);

        return $pdf->download($this->filename($protocol, 'certificate'));
    }

    private function privileged(Request $request, Protocol $protocol): bool
    {
        return $request->user()->is_admin || $request->user()->id === $protocol->user_id;
    }

    /** What both documents show about the registration. */
    private function record(Protocol $protocol): array
    {
        $summary = PublicRegister::summarize($protocol);
        $registeredAt = $protocol->registration_date ? Carbon::parse($protocol->registration_date) : null;
        $start = $summary['start_date'] ? Carbon::parse($summary['start_date']) : null;

        return [
            'protocol' => $protocol,
            'title' => $protocol->title,
            'pctId' => $protocol->status === 'published' ? $protocol->pct_id : null,
            'status' => ['draft' => 'Draft', 'submitted_for_publication' => 'Submitted for publication', 'resubmitted_for_publication' => 'Resubmitted for publication', 'rejected' => 'Needs changes', 'published' => 'Published'][$protocol->status] ?? $protocol->status,
            'registeredAt' => $registeredAt?->copy()->setTimezone(config('pct.display_timezone'))->format('j F Y, H:i T'),
            'startDate' => $start?->format('j F Y'),
            'timing' => ProtocolPageController::timing($registeredAt, $start),
            'studyStatus' => $summary['study_status_label'],
            'centre' => trim(implode(', ', array_filter([$summary['centre_name'], $summary['centre_city'], $summary['country_name']])), ', '),
            'embargo' => $protocol->has_embargo ? ($protocol->embargo_end_date ? 'Until '.Carbon::parse($protocol->embargo_end_date)->format('j F Y') : 'Yes') : 'None',
            'url' => url("/database/view-protocol/{$protocol->id}"),
        ];
    }

    /**
     * The visible fields of a section, with their visible sub-fields, as on the protocol page.
     *
     * @param  array<string, mixed>  $values
     * @return array<int, array<string, mixed>>
     */
    private function rows(string $section, array $values, ?string $group = null, bool $privileged = true, array $private = []): array
    {
        $fields = ProtocolSchema::fields()->where('section', $section)
            ->when($group, fn ($fields) => $fields->where('group', $group))
            ->filter(fn ($field) => ($privileged || $field['public']) && ! in_array($field['key'], $private, true));

        return $fields
            ->filter(fn ($field) => (empty($field['parent']) || ! empty($field['number'])) && ProtocolSchema::isVisible($field, $values))
            ->map(fn ($field) => [
                ...$this->cell($field, $values),
                'number' => $field['number'] ?? null,
                'children' => $fields
                    ->filter(fn ($child) => ($child['parent'] ?? null) === $field['key'] && empty($child['number']) && ProtocolSchema::isVisible($child, $values))
                    ->map(fn ($child) => $this->cell($child, $values))
                    ->filter(fn ($cell) => $cell['text'] !== null || $cell['table'] || $cell['images'])
                    ->values()->all(),
            ])
            ->values()->all();
    }

    private function cell(array $field, array $values): array
    {
        $value = $values[$field['key']] ?? null;
        $formatted = $field['type'] === 'longtext' && is_string($value) ? $value : ProtocolSchema::format($field, $value);
        // As on the page: older short answers can hold markup and escaped characters too.
        $text = $formatted === null ? null : (ProtocolSchema::plainText($formatted) ?: null);

        $rich = $text !== null && $field['type'] === 'longtext' && $field['key'] !== 'sum_of_animals' && preg_match('/<\/?[a-z][^>]*>/i', (string) $value);

        return [
            'label' => $field['label'],
            'text' => $text,
            // Cleaned again here: answers from the legacy editor were never cleaned on the server.
            'html' => $rich ? Html::answer($value) : null,
            'table' => match ($field['type']) {
                'study_arms' => $this->table(['Type', 'Intervention', 'Animals'], $value, fn ($arm) => [ucfirst($this->text(data_get($arm, 'type'))), $this->text(data_get($arm, 'intervention')), $this->text(data_get($arm, 'number'))]),
                'study_centres' => $this->table(['Name', 'City', 'Country'], $value, fn ($centre) => [$this->text(data_get($centre, 'name')), $this->text(data_get($centre, 'city')), config('pct.countries.'.data_get($centre, 'country')) ?? $this->text(data_get($centre, 'country'))]),
                default => null,
            },
            'images' => in_array($field['type'], ['image', 'images'], true) ? count(array_filter((array) $value)) : 0,
        ];
    }

    private function table(array $headers, mixed $rows, callable $row): ?array
    {
        // Rows left empty in the legacy form are skipped.
        $rows = is_array($rows) ? array_values(array_filter(array_map($row, $rows), fn (array $cells) => implode('', $cells) !== '')) : [];

        return $rows ? ['headers' => $headers, 'rows' => $rows] : null;
    }

    /** A table cell as typed; older rows were stored with escaped characters. */
    private function text(mixed $value): string
    {
        return is_scalar($value) ? trim(html_entity_decode((string) $value, ENT_QUOTES | ENT_HTML5)) : '';
    }

    private function now(): string
    {
        return now()->setTimezone(config('pct.display_timezone'))->format('j F Y, H:i T');
    }

    private function filename(Protocol $protocol, string $kind): string
    {
        return ($protocol->status === 'published' ? $protocol->pct_id : "draft-{$protocol->id}")."-$kind.pdf";
    }
}
