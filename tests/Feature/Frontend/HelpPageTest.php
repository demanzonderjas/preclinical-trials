<?php

namespace Tests\Feature\Frontend;

use App\Models\FaqCategory;
use App\Models\FaqItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HelpPageTest extends TestCase
{
    use RefreshDatabase;

    private function faq(string $title, ?array $audiences = null, string $status = 'published', string $content = '<p>Answer</p>'): FaqItem
    {
        $category = FaqCategory::where('name', 'Registration')->first();
        if (! $category) {
            $category = new FaqCategory();
            $category->name = 'Registration';
            $category->save();
        }
        $item = new FaqItem(['title' => $title, 'content' => $content, 'status' => $status, 'audiences' => $audiences]);
        $item->faq_category_id = $category->id;
        $item->save();

        return $item;
    }

    public function test_shows_published_questions_for_the_chosen_audience(): void
    {
        $this->faq('How do I register?');
        $this->faq('When was a study registered?', ['ethics', 'editor']);
        $this->faq('Draft question', null, 'draft');

        $this->get('/help')->assertInertia(fn (Assert $page) => $page
            ->component('help')
            ->where('audience', 'researcher')
            ->has('items', 1)
            ->where('items.0.title', 'How do I register?')
            ->where('total', 2)
            ->where('audiences', fn ($audiences) => collect($audiences)->pluck('count', 'value')->all() === ['researcher' => 1, 'ethics' => 1, 'editor' => 1, 'funder' => 0, 'public' => 0]));

        $this->get('/help?for=ethics')->assertInertia(fn (Assert $page) => $page->where('audience', 'ethics')->where('items.0.title', 'When was a study registered?'));
    }

    public function test_searches_titles_and_answers(): void
    {
        $this->faq('Is registration free?', null, 'published', '<p>Yes, always.</p>');
        $this->faq('Can I choose an embargo?', null, 'published', '<p>One year after approval.</p>');

        $this->get('/help?q=embargo')->assertInertia(fn (Assert $page) => $page->where('results.0.title', 'Can I choose an embargo?')->has('results', 1));
        $this->get('/help?q=year+approval')->assertInertia(fn (Assert $page) => $page->has('results', 1));
        $this->get('/help')->assertInertia(fn (Assert $page) => $page->where('results', null));
    }

    public function test_counts_one_helpful_vote_per_session(): void
    {
        $item = $this->faq('Is registration free?');

        $this->from('/help')->post("/help/{$item->id}/feedback", ['helpful' => true])->assertRedirect('/help');
        $this->from('/help')->post("/help/{$item->id}/feedback", ['helpful' => false])->assertRedirect('/help');

        $this->assertSame(1, $item->fresh()->helpful_count);
        $this->assertSame(0, $item->fresh()->not_helpful_count);
        $this->get('/help')->assertInertia(fn (Assert $page) => $page->where("voted.{$item->id}", true));
    }

    public function test_drafts_cannot_be_voted_on(): void
    {
        $item = $this->faq('Draft', null, 'draft');

        $this->post("/help/{$item->id}/feedback", ['helpful' => true])->assertNotFound();
    }
}
