<?php

namespace Tests\Feature\Frontend;

use App\Mail\ContactFormSubmitted;
use App\Models\ContactForm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContactPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_prefills_from_the_link_and_the_logged_in_user(): void
    {
        $this->get('/contact?topic=record&pct_id=pcte0000731&email=visitor@example.test')
            ->assertInertia(fn (Assert $page) => $page
                ->component('contact')
                ->where('prefill.topic', 'record')
                ->where('prefill.pct_id', 'PCTE0000731')
                ->where('prefill.email', 'visitor@example.test'));

        $this->get('/contact?topic=nonsense&pct_id=1;drop')
            ->assertInertia(fn (Assert $page) => $page->where('prefill.topic', null)->where('prefill.pct_id', null));

        $user = User::factory()->create(['first_name' => 'Sanne', 'last_name' => 'de Vries']);
        $this->actingAs($user)->get('/contact')
            ->assertInertia(fn (Assert $page) => $page->where('prefill.name', 'Sanne de Vries')->where('prefill.email', $user->email));
    }

    public function test_sends_the_message_with_topic_and_pct_id(): void
    {
        Mail::fake();

        $this->from('/contact')->post('/contact', [
            'name' => 'Ilse Jansen',
            'email' => 'ilse@example.test',
            'topic' => 'embargo',
            'pct_id' => 'pcte0000731',
            'message' => 'How does an extension work?',
        ])->assertRedirect('/contact')->assertSessionHas('success');

        $form = ContactForm::firstOrFail();
        $this->assertSame('embargo', $form->topic);
        $this->assertSame('PCTE0000731', $form->pct_id);
        Mail::assertSent(ContactFormSubmitted::class, fn ($mail) => $mail->hasTo('admin@pct.test'));
    }

    public function test_validates_the_form(): void
    {
        $this->from('/contact')->post('/contact', ['topic' => 'hack', 'pct_id' => 'x', 'message' => str_repeat('a', 2001)])
            ->assertSessionHasErrors(['name', 'email', 'topic', 'pct_id', 'message']);
        $this->assertSame(0, ContactForm::count());
    }

    public function test_the_admin_mail_escapes_the_message(): void
    {
        $form = new ContactForm();
        $form->name = 'Visitor';
        $form->email = 'visitor@example.test';
        $form->topic = 'other';
        $form->message = "<a href=\"https://evil.example\">Click</a>\nSecond line";
        $form->save();

        $html = (new ContactFormSubmitted($form))->render();

        $this->assertStringNotContainsString('href="https://evil.example"', $html);
        $this->assertStringContainsString('Click<br />', $html);
        $this->assertStringContainsString('Topic: Something else', $html);
    }

    public function test_is_limited_to_ten_messages_a_minute(): void
    {
        Mail::fake();
        $payload = ['name' => 'V', 'email' => 'v@example.test', 'topic' => 'other', 'message' => 'Hi'];

        for ($i = 0; $i < 10; $i++) {
            $this->post('/contact', $payload)->assertRedirect();
        }
        $this->post('/contact', $payload)->assertStatus(429);
    }
}
