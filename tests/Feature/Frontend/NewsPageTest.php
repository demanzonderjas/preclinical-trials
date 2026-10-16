<?php

namespace Tests\Feature\Frontend;

use App\Models\NewsItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NewsPageTest extends TestCase
{
    use RefreshDatabase;

    private function item(string $title, string $date, ?string $category = null, string $status = 'published'): NewsItem
    {
        $item = new NewsItem(['title' => $title, 'status' => $status, 'summary' => "<p>About $title</p>", 'content' => "<p>$title</p>", 'publish_date' => $date, 'category' => $category]);
        $item->save();

        return $item;
    }

    public function test_features_the_newest_item_and_groups_the_rest_by_year(): void
    {
        $this->item('Webinar', '2024-03-07', 'events');
        $this->item('EUSAAT', '2024-09-20', 'events');
        $this->item('Funding', '2023-11-01', 'funding');
        $this->item('Draft', '2025-01-01', null, 'draft');

        $this->get('/news')->assertInertia(fn (Assert $page) => $page
            ->component('news/index')
            ->where('total', 3)
            ->where('featured.title', 'EUSAAT')
            ->where('featured.summary', 'About EUSAAT')
            ->where('years.0.year', 2024)
            ->where('years.0.items.0.title', 'Webinar')
            ->where('years.1.year', 2023)
            ->where('categories', fn ($categories) => collect($categories)->pluck('count', 'value')->all() === ['events' => 2, 'funding' => 1, 'team' => 0, 'publications' => 0]));
    }

    public function test_filters_by_category_and_sorts_oldest_first(): void
    {
        $this->item('Webinar', '2024-03-07', 'events');
        $this->item('EUSAAT', '2024-09-20', 'events');
        $this->item('Older event', '2022-07-11', 'events');
        $this->item('Funding', '2023-11-01', 'funding');

        $this->get('/news?category=events&sort=oldest')->assertInertia(fn (Assert $page) => $page
            ->where('category', 'events')
            ->where('featured.title', 'EUSAAT')
            ->where('years.0.year', 2022)
            ->where('years.1.items.0.title', 'Webinar'));

        $this->get('/news?category=nonsense')->assertInertia(fn (Assert $page) => $page->where('category', null));
    }

    public function test_shows_published_items_only(): void
    {
        $published = $this->item('EUSAAT', '2024-09-20');
        $draft = $this->item('Draft', '2025-01-01', null, 'draft');

        $this->get("/news/view-item/{$published->id}")->assertOk()->assertInertia(fn (Assert $page) => $page->component('news/show')->where('item.title', 'EUSAAT'));
        $this->get("/news/view-item/{$draft->id}")->assertNotFound();
    }
}
