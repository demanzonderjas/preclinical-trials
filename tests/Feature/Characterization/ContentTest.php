<?php

namespace Tests\Feature\Characterization;

use App\Mail\ContactFormSubmitted;
use App\Models\Ambassador;
use App\Models\ContactForm;
use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Models\NewsItem;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContentTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();
	}

	protected function makeNewsItem(string $status, ?string $publishDate = null): NewsItem
	{
		$item = new NewsItem(['title' => "News ($status)", 'status' => $status, 'summary' => 'S', 'content' => 'C', 'publish_date' => $publishDate]);
		$item->save();

		return $item;
	}

	protected function makeCategory(string $name): FaqCategory
	{
		$category = new FaqCategory();
		$category->name = $name;
		$category->save();

		return $category;
	}

	protected function makeFaqItem(FaqCategory $category, string $title, string $status = 'published'): FaqItem
	{
		$item = new FaqItem(['title' => $title, 'content' => 'Answer', 'status' => $status]);
		$item->faq_category_id = $category->id;
		$item->save();

		return $item;
	}

	protected function makePage(string $slug, string $title = 'About'): Page
	{
		$page = new Page();
		$page->title = $title;
		$page->slug = $slug;
		$page->content_blocks = [['type' => 'text', 'text' => 'Hello']];
		$page->save();

		return $page;
	}

	public function test_public_news_excludes_drafts()
	{
		$published = $this->makeNewsItem('published');
		$this->makeNewsItem('draft');

		$items = $this->getJson('/api/news-items')->assertOk()->json('news_items');

		$this->assertEquals([$published->id], collect($items)->pluck('id')->all());
	}

	/**
	 * Oddity: `publish_date` is stored but not used for visibility; any non-draft status is
	 * public, including items dated in the future.
	 */
	public function test_public_news_ignores_publish_date()
	{
		$future = $this->makeNewsItem('published', now()->addMonth()->toDateString());

		$items = $this->getJson('/api/news-items')->json('news_items');

		$this->assertEquals([$future->id], collect($items)->pluck('id')->all());
	}

	public function test_public_news_is_ordered_by_last_update()
	{
		$older = $this->makeNewsItem('published');
		$older->updated_at = now()->subDay();
		$older->save();
		$newer = $this->makeNewsItem('published');

		$ids = collect($this->getJson('/api/news-items')->json('news_items'))->pluck('id')->all();

		$this->assertEquals([$newer->id, $older->id], $ids);
	}

	public function test_a_draft_news_item_is_only_readable_by_admins()
	{
		$draft = $this->makeNewsItem('draft');

		$this->getJson("/api/news-item/{$draft->id}")->assertNotFound();
		$this->actingAs($this->makeAdmin())->getJson("/api/news-item/{$draft->id}")
			->assertOk()
			->assertJsonPath('news_item.title', 'News (draft)')
			->assertJsonPath('news_item.status', 'draft');
	}

	public function test_faq_lists_categories_with_their_published_items()
	{
		$general = $this->makeCategory('General');
		$technical = $this->makeCategory('Technical');
		$this->makeFaqItem($general, 'What is PCT?');
		$this->makeFaqItem($general, 'Draft question', 'draft');
		$this->makeFaqItem($technical, 'How do I register?');

		$response = $this->getJson('/api/faq')->assertOk()->assertJsonPath('success', true)
			->assertJsonStructure(['categories' => [['id', 'name', 'order', 'faq_items' => [['id', 'title', 'content', 'status', 'faq_category_id', 'category']]]]]);

		$categories = collect($response->json('categories'))->keyBy('name');
		$this->assertSame(['What is PCT?'], collect($categories['General']['faq_items'])->pluck('title')->all());
		$this->assertSame(['How do I register?'], collect($categories['Technical']['faq_items'])->pluck('title')->all());
		$this->assertSame('Technical', $categories['Technical']['faq_items'][0]['category']);
	}

	public function test_faq_categories_are_listed()
	{
		$this->makeCategory('General');

		$this->getJson('/api/faq-categories')->assertOk()
			->assertJsonPath('success', true)
			->assertJsonPath('categories.0.name', 'General');
	}

	public function test_ambassadors_are_listed_publicly()
	{
		Ambassador::create(['name' => 'Dr. Jansen', 'description' => 'Utrecht ambassador', 'geo_search' => 'Utrecht', 'longitude' => '5.12', 'latitude' => '52.09']);

		$this->getJson('/api/ambassadors')->assertOk()
			->assertJsonPath('success', true)
			->assertJsonPath('ambassadors.0.name', 'Dr. Jansen')
			->assertJsonPath('ambassadors.0.latitude', '52.09');
	}

	public function test_page_by_slug_and_by_id()
	{
		$page = $this->makePage('about', 'About PCT');

		$this->postJson('/api/page/slug', ['slug' => 'about'])->assertOk()
			->assertJsonPath('page.title', 'About PCT')
			->assertJsonPath('page.content_blocks.0.text', 'Hello');
		$this->getJson("/api/page/{$page->id}")->assertOk()->assertJsonPath('page.slug', 'about');
	}

	public function test_unknown_page_slug_is_not_found()
	{
		$this->postJson('/api/page/slug', ['slug' => 'nope'])->assertNotFound();
	}

	public function test_admin_news_item_round_trip()
	{
		$admin = $this->makeAdmin();

		$created = $this->actingAs($admin)->postJson('/api/news-item', [
			'title' => 'Launch', 'summary' => 'Short', 'content' => '<p>Long</p>', 'image' => 'launch.png',
			'publish_date' => '2026-11-01', 'status' => 'draft',
		])->assertOk()->assertJsonPath('success', true)->json('news_item');
		$this->assertSame('launch.png', NewsItem::findOrFail($created['id'])->image);
		$this->assertSame([], $this->getJson('/api/news-items')->json('news_items'));
		$this->assertCount(1, $this->actingAs($admin)->getJson('/api/news-items/admin')->json('news_items'));

		$this->actingAs($admin)->putJson('/api/news-item', [
			'news_item_id' => $created['id'], 'title' => 'Launched', 'summary' => 'Short', 'content' => '<p>Long</p>',
			'image' => 'launch.png', 'publish_date' => '2026-11-01', 'status' => 'published',
		])->assertOk()->assertJsonPath('news_item.title', 'Launched')->assertJsonPath('news_item.image', 'launch.png');
		$this->assertSame(['Launched'], collect($this->getJson('/api/news-items')->json('news_items'))->pluck('title')->all());

		$this->actingAs($admin)->deleteJson("/api/news-item/{$created['id']}")->assertExactJson(['success' => true]);
		$this->assertNull(NewsItem::find($created['id']));
	}

	public function test_deleting_a_news_image_cannot_reach_outside_the_news_folder()
	{
		$outside = public_path('e2e-guard-' . uniqid() . '.txt');
		file_put_contents($outside, 'keep me');

		try {
			$this->actingAs($this->makeAdmin())
				->postJson('/api/news-item/delete-image', ['filename' => '../../' . basename($outside)])
				->assertExactJson(['success' => false]);
			$this->assertFileExists($outside);
		} finally {
			@unlink($outside);
		}
	}

	public function test_admin_faq_item_round_trip()
	{
		$admin = $this->makeAdmin();
		$general = $this->makeCategory('General');
		$technical = $this->makeCategory('Technical');

		$created = $this->actingAs($admin)->postJson('/api/faq-item', [
			'title' => 'Q1', 'content' => 'A1', 'status' => 'published', 'faq_category_id' => $general->id,
		])->assertOk()->assertJsonPath('success', true)->assertJsonPath('faq_item.category', 'General')->json('faq_item');

		$this->actingAs($admin)->putJson('/api/faq-item', [
			'faq_item_id' => $created['id'], 'title' => 'Q1b', 'content' => 'A1b', 'status' => 'draft', 'faq_category_id' => $technical->id,
		])->assertOk()->assertJsonPath('faq_item.title', 'Q1b');

		$this->actingAs($admin)->getJson("/api/faq-item/{$created['id']}")->assertOk()
			->assertJsonPath('faq_item.content', 'A1b')
			->assertJsonPath('faq_item.status', 'draft')
			->assertJsonPath('faq_item.category', 'Technical');
		$this->assertCount(1, $this->actingAs($admin)->getJson('/api/faq-items/admin')->json('faq_items'));

		$this->actingAs($admin)->deleteJson("/api/faq-item/{$created['id']}")->assertExactJson(['success' => true]);
		$this->assertNull(FaqItem::find($created['id']));
	}

	/**
	 * Note: the ambassador name is read from the `contact_name` request field.
	 */
	public function test_admin_ambassador_round_trip()
	{
		$admin = $this->makeAdmin();

		$created = $this->actingAs($admin)->postJson('/api/ambassador', [
			'contact_name' => 'Dr. Jansen', 'description' => 'Utrecht ambassador', 'geo_search' => 'Utrecht',
			'longitude' => '5.12', 'latitude' => '52.09',
		])->assertOk()->assertJsonPath('success', true)->assertJsonPath('ambassador.name', 'Dr. Jansen')->json('ambassador');

		$this->assertSame(['Dr. Jansen'], collect($this->getJson('/api/ambassadors')->json('ambassadors'))->pluck('name')->all());

		$this->actingAs($admin)->deleteJson("/api/ambassador/{$created['id']}")->assertExactJson(['success' => true]);
		$this->assertSame([], $this->getJson('/api/ambassadors')->json('ambassadors'));
	}

	public function test_admin_page_update()
	{
		$admin = $this->makeAdmin();
		$page = $this->makePage('about');

		$this->actingAs($admin)->putJson('/api/page', [
			'page_id' => $page->id,
			'title' => 'About us',
			'subtitle' => 'Who we are',
			'content_blocks' => [['type' => 'text', 'text' => 'Updated']],
		])->assertOk()->assertJsonPath('page.title', 'About us')->assertJsonPath('page.content_blocks.0.text', 'Updated');

		$this->postJson('/api/page/slug', ['slug' => 'about'])
			->assertJsonPath('page.subtitle', 'Who we are')
			->assertJsonPath('page.content_blocks.0.text', 'Updated');
		$this->assertCount(1, $this->actingAs($admin)->getJson('/api/pages')->json('pages'));
	}

	public function test_contact_form_is_stored_and_mailed_to_admin()
	{
		$this->postJson('/api/contact-form', [
			'name' => 'Visitor', 'email' => 'visitor@example.test', 'message' => 'How do I register a protocol?',
		])->assertOk()->assertExactJson(['success' => true]);

		$form = ContactForm::firstOrFail();
		$this->assertSame('Visitor', $form->name);
		$this->assertSame('visitor@example.test', $form->email);
		$this->assertSame('How do I register a protocol?', $form->message);
		Mail::assertSent(ContactFormSubmitted::class, function ($m) use ($form) {
			return $m->hasTo('admin@pct.test') && $m->form->id === $form->id;
		});
	}


	public function test_contact_form_is_throttled_to_10_per_minute()
	{
		$payload = ['name' => 'Visitor', 'email' => 'visitor@example.test', 'message' => 'Hi'];

		for ($i = 1; $i <= 10; $i++) {
			$this->postJson('/api/contact-form', $payload)->assertOk();
		}
		$this->postJson('/api/contact-form', $payload)->assertStatus(429);

		$this->assertSame(10, ContactForm::count());
		Mail::assertSent(ContactFormSubmitted::class, 10);
	}
}
