<?php

namespace Database\Seeders;

use App\Models\FaqCategory;
use App\Models\FaqItem;
use Illuminate\Database\Seeder;


class FaqItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faqItems = [
            [
                "category" => "Registration",
                "title" => "How do I register?",
                "content" => "Go to the homepage and click 'Join to create a user account' and fill in the form. We will send you an automatic email as confirmation and all you need to is click the link in that email to confirm your request. If you do not receive the automatic email within a few minutes check your Spam filters in case it has been blocked. If the message is there then please mark perclinicaltrials.eu as a safe sender so the filters do not block subsequent messages. If it’s still not there then please contact <a href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a> for help.</p>"
            ]
        ];

        foreach ($faqItems as $item) {
            $f = new FaqItem();
            $f->faq_category_id = FaqCategory::where('name', $item['category'])->first()->id;
            $f->title = $item["title"];
            $f->content = isset($item["content"]) ? $item["content"] : "";
            $f->show = true;
            $f->save();
        }
    }
}
