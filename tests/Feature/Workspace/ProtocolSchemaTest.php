<?php

namespace Tests\Feature\Workspace;

use App\Services\ProtocolSchema;
use Illuminate\Support\Facades\Process;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ProtocolSchemaTest extends TestCase
{
    use BuildsPctData;

    public function test_the_exported_json_matches_the_typescript_schema(): void
    {
        $this->requireNode();

        $result = Process::path(base_path())->run(['node', 'scripts/export-protocol-schema.mjs', '--check']);

        $this->assertTrue($result->successful(), $result->errorOutput());
    }

    public function test_visibility_and_formatting_match_the_typescript_original(): void
    {
        $this->requireNode();
        $fields = ProtocolSchema::fields();

        // Every value each condition looks at, alone and as a list, plus a full protocol.
        $valueSets = [[]];
        foreach ($fields->pluck('showIf')->filter()->flatten(1) as $condition) {
            $options = collect(ProtocolSchema::field($condition['key'])['options'] ?? [])->pluck('value')
                ->merge((array) ($condition['equals'] ?? $condition['notIn'] ?? $condition['overlaps'] ?? $condition['includes'] ?? []))
                ->unique();
            foreach ($options as $option) {
                $valueSets[] = [$condition['key'] => $option];
                $valueSets[] = [$condition['key'] => [$option]];
            }
            $valueSets[] = [$condition['key'] => $options->values()->all()];
        }
        $valueSets[] = $this->protocolDetails();
        $valueSets[] = ['randomisation' => 'yes', 'randomisation_method' => 'other', 'blinding' => 'yes_partially', 'study_status' => 'completed_and_published', 'intervention_type' => ['drug', 'other']];

        $formats = [];
        foreach ($fields as $field) {
            foreach (collect($field['options'] ?? [])->pluck('value')->push('unknown') as $value) {
                $formats[] = [$field['key'], $value];
            }
            $formats[] = [$field['key'], ['a', $field['options'][0]['value'] ?? 'b', '']];
            $formats[] = [$field['key'], '2025-02-03'];
            $formats[] = [$field['key'], ''];
            $formats[] = [$field['key'], null];
            $formats[] = [$field['key'], '<a href="x">https://doi.org/1</a>'];
        }

        $result = Process::path(base_path())->input(json_encode(['valueSets' => $valueSets, 'formats' => $formats]))->run(['node', 'scripts/protocol-schema-oracle.mjs']);
        $this->assertTrue($result->successful(), $result->errorOutput());
        $expected = json_decode($result->output(), true);

        foreach ($valueSets as $index => $values) {
            $visible = $fields->filter(fn ($field) => ProtocolSchema::isVisible($field, $values))->pluck('key')->values()->all();
            $this->assertSame($expected['visible'][$index], $visible, 'visibility for '.json_encode($values));
        }
        foreach ($valueSets as $index => $values) {
            $this->assertSame($expected['progress'][$index], ProtocolSchema::progress($values), 'progress for '.json_encode($values));
        }
        foreach ($formats as $index => [$key, $value]) {
            $this->assertSame($expected['formatted'][$index], ProtocolSchema::format(ProtocolSchema::field($key), $value), "format of $key = ".json_encode($value));
        }
    }

    private function requireNode(): void
    {
        if (! Process::run(['node', '--version'])->successful()) {
            $this->markTestSkipped('Node is not installed.');
        }
    }
}
