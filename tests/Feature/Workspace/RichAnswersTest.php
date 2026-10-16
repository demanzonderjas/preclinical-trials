<?php

namespace Tests\Feature\Workspace;

use App\Services\ProtocolSchema;
use App\Support\Html;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/** Long answers keep paragraphs, lists, emphasis and links, whatever they were pasted from. */
class RichAnswersTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_word_markup_is_reduced_to_the_answer_tags(): void
    {
        $word = '<p class="MsoNormal" style="mso-margin-top-alt:auto"><span lang="EN-GB" style="font-family:Calibri">Mice <b>and</b> <i>rats</i><o:p></o:p></span></p>'
            .'<ul><li style="color:red">one</li></ul><h2>Heading</h2><table><tr><td>cell</td></tr></table>';

        $this->assertSame('<p>Mice <b>and</b> <i>rats</i></p><ul><li>one</li></ul><p>Heading</p><p>cell</p>', Html::answer($word));
        $this->assertSame('<p>Group · n</p><p>Control · 12</p>', Html::answer('<table><tr><th>Group</th><th>n</th></tr><tr><td>Control</td><td>12</td></tr></table>'));
    }

    public function test_scripts_handlers_and_unsafe_links_are_removed(): void
    {
        $clean = Html::answer('<p onclick="x()">a<script>alert(1)</script><img src="x" onerror="alert(2)"></p><a href="javascript:alert(3)">j</a> <a href="/admin">rel</a> <a href="https://pct.eu" target="_blank">ok</a>');

        $this->assertStringNotContainsString('script', $clean);
        $this->assertStringNotContainsString('onclick', $clean);
        $this->assertStringNotContainsString('<img', $clean);
        $this->assertStringNotContainsString('javascript:', $clean);
        $this->assertStringNotContainsString('href="/admin"', $clean, 'answers link to absolute addresses only');
        $this->assertStringContainsString('<a href="https://pct.eu" target="_blank" rel="noopener noreferrer">ok</a>', $clean);
    }

    public function test_the_form_saves_cleaned_answers_and_leaves_plain_text_alone(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner);

        $this->actingAs($owner)->putJson("/dashboard/protocols/{$protocol->id}/answers", ['values' => [
            'hypothesis' => '<p style="color:red">Dapagliflozin <strong>limits</strong> remodelling</p><ul><li><p>in mice</p></li></ul><script>alert(1)</script>',
            'primary_readout_parameter' => 'Infarct size, p < 0.05 & n > 6',
            'title' => 'A <b>title</b> stays as typed',
        ]])->assertOk();

        $this->assertSame('<p>Dapagliflozin <strong>limits</strong> remodelling</p><ul><li><p>in mice</p></li></ul>', $this->detailValue($protocol, 'hypothesis'));
        $this->assertSame('Infarct size, p < 0.05 & n > 6', $this->detailValue($protocol, 'primary_readout_parameter'));
        $this->assertSame('A <b>title</b> stays as typed', $this->detailValue($protocol, 'title'), 'short answers are shown as text, never as HTML');
    }

    public function test_the_editors_own_output_passes_unchanged(): void
    {
        $editor = '<p>First <em>line</em><br>second</p><ol><li><p>one</p></li></ol><p><a target="_blank" rel="noopener noreferrer" href="https://pct.eu">PCT</a> &amp; µg</p>';

        $this->assertSame(['hypothesis' => $editor], ProtocolSchema::cleanAnswers(['hypothesis' => $editor]));
    }

    public function test_the_pdf_shows_formatted_answers_cleaned_again(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);
        // As the legacy editor stored it: never cleaned on the server.
        $protocol->addDetailsToDatabase(['hypothesis' => '<p>Limits <b>remodelling</b></p><ul><li>mice</li></ul><img src=x onerror=alert(1)>']);

        $this->withoutExceptionHandling();
        $cells = [];
        view()->composer('pdf.protocol', function ($view) use (&$cells) {
            $cells = collect($view->sections)->flatMap(fn ($section) => [...($section['fields'] ?? []), ...collect($section['groups'] ?? [])->flatMap(fn ($group) => $group['fields'])])->keyBy('label')->all();
        });
        $this->actingAs($owner)->get("/database/view-protocol/{$protocol->id}/pdf")->assertOk();

        $hypothesis = $cells['Hypothesis / Research question'];
        $this->assertSame('<p>Limits <b>remodelling</b></p><ul><li>mice</li></ul>', $hypothesis['html']);
        $this->assertSame("Limits remodelling\nmice", $hypothesis['text']);
    }
}
