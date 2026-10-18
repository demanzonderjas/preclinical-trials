<?php

namespace Tests\Feature\Workspace;

use App\Models\Detail;
use App\Services\ProtocolSchema;
use App\Services\PublicRegister;
use App\Support\Html;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/** Answers as the legacy site stored them, read and shown by the new one. */
class LegacyAnswersTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_the_migration_rewrites_old_option_spellings(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser());
        $protocol->addDetailsToDatabase([
            'study_status' => 'completed_and_published_full-text',
            'randomisation_method_used' => 'computer-generated_random_number_sequence',
            'financial_support' => ['investigator driven', '_investigator_driven', 'grants'],
            'intervention_type' => ['not applicable'],
            'species' => 'pigs',
            'hypothesis' => 'not applicable', // free text stays as typed
        ]);

        (require database_path('migrations/2026_10_18_120000_normalise_legacy_answer_values.php'))->up();

        $this->assertSame('completed_and_published_full_text', $this->detailValue($protocol, 'study_status'));
        $this->assertSame('computer_generated_random_number_sequence', $this->detailValue($protocol, 'randomisation_method_used'));
        $this->assertSame(['investigator_driven', 'grants'], $this->detailValue($protocol, 'financial_support'));
        $this->assertSame(['not_applicable'], $this->detailValue($protocol, 'intervention_type'));
        $this->assertSame('pig', $this->detailValue($protocol, 'species'));
        $this->assertSame('not applicable', $this->detailValue($protocol, 'hypothesis'));
        $this->assertSame('Completed and published', PublicRegister::summarize($protocol->fresh('details'))['study_status_label']);
    }

    public function test_values_without_a_label_read_as_text_not_as_keys(): void
    {
        $this->assertSame('Completed and published', PublicRegister::option('study_status', 'completed_and_published_full_text'));
        $this->assertSame('Some retired value', PublicRegister::option('study_status', 'some_retired_value'));
        $this->assertSame(
            'Outcome assessors are blinded',
            ProtocolSchema::format(ProtocolSchema::field('investigators_blinded_assessment'), 'outcome_assessors_are_blinded')
        );
    }

    public function test_plain_text_drops_pasted_code_and_keeps_comparisons(): void
    {
        $this->assertSame(
            "Readouts\np<0.05 and n>3 – µg",
            ProtocolSchema::plainText('<style>p { color: red }</style><!--[if gte mso 9]><xml>x</xml><![endif]--><p>Readouts</p><script>msoCommentShow()</script>p&lt;0.05 and n>3 &ndash; &micro;g<a href="#_msoanchor_1">[E1]</a>')
        );
    }

    public function test_answers_keep_superscript_and_subscript(): void
    {
        $this->assertSame('<p>10<sup>6</sup> cells in CO<sub>2</sub></p>', Html::answer('<p>10<sup style="x">6</sup> cells in CO<sub>2</sub></p>'));
    }

    public function test_word_comment_markers_and_escaped_styles_are_removed(): void
    {
        $this->assertSame('<p>in the kidney </p>', Html::answer('<p>in the kidney <a href="#_msoanchor_1">[E1]</a></p>'));
        $this->assertSame('<p>Sample size</p>', Html::answer('&lt;style&gt;a { color: red }&lt;/style&gt;<p>Sample size</p>'));
        $this->assertSame('Sample size', ProtocolSchema::plainText('<p>&lt;title&gt;&lt;/title&gt;Sample size</p>'));
    }
}
