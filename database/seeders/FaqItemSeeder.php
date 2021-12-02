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
                "content" => "<p>Go to the homepage and click 'Join to create a user account' and fill in the form. We will send you an automatic email as confirmation and all you need to is click the link in that email to confirm your request. If you do not receive the automatic email within a few minutes check your Spam filters in case it has been blocked. If the message is there then please mark perclinicaltrials.eu as a safe sender so the filters do not block subsequent messages. If it’s still not there then please contact <a href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a> for help.</p>"
            ],
            [
                "category" => "Registration",
                "title" => "Is registration free?",
                "content" => "<p>Yes</p>"
            ],
            [
                "category" => "Protocols",
                "title" => "How do I submit a protocol?",
                "content" => "<p>Once you are logged in, click 'Create a new record' and simply complete the form. Once you are happy that you have answered all mandatory questions click the 'Submit for publication' button. If you find that you run out of time when filling in the form you can just click the 'Save changes for later' button and the information you have provided will be saved for later. You will not be able to submit the form if you have missed any mandatory questions, which will be highlighted in red for you when you click the 'Submit for publication' button.</p>"
            ],
            [
                "category" => "Privacy",
                "title" => "Are personal details of researcher visible on the website?",
                "content" => "<p>You can choose if you want to share your contact details or if you would rather anonymize them. If you choose to anonymize your contact details, it will be possible for other members Preclinicaltrials.eu to contact you by an anonymized email address.</p>"
            ],
            [
                "category" => "Protocols",
                "title" => "Will there be a time-stamped date on my protocol?",
                "content" => "<p>Yes. The protocol will be time-stamped on the date of submission and the date of publication.</p>"
            ],
            [
                "category" => "Protocols",
                "title" => "What will happen with my submitted protocol?",
                "content" => "<p>Every submission will be checked if it is a protocol of an animal study and if it is filled out correctly. Importantly, no additional ethical or scientific review will be performed.</p>"
            ],
            [
                "category" => "Protocols",
                "title" => "Will I be notified if my study has been accepted for publication?",
                "content" => "<p>Yes. You will receive an email when your record is accepted for publication. Your record will also be flagged as “published” in the “View my previous submissions” section.</p>"
            ],
            [
                "category" => "Privacy",
                "title" => "Will my published protocol be openly accessible to everyone?",
                "content" => "<p>The database is accessible for anyone who visits the website. You can choose per protocol whether you want to publish all data immediately, or if you want to have an embargo on the details of your protocol. If you choose to use the embargo, limited information will appear online immediately (Preclinicaltrials.eu ID, (anonymized) contact details, date of submission and sunrise date). The sunrise date is automatically set at 1 year after acceptance of your protocol.</p>"
            ],
            [
                "category" => "Privacy",
                "title" => "If I choose the embargo, what data will be published immediately after approval?",
                "content" => "<p>A selection of data will be published immediately:<ul><li>PreclinicalTrials.eu ID</li><li>(anonymized) contact details</li><li>Date of submission</li><li>Date of publication</li></ul></p>"
            ],
            [
                "category" => "Privacy",
                "title" => "I do not want to share sensitive data, also not after one year. Can I redact data?",
                "content" => "<p>No, you are not able to redact data. However, we mainly focus on the methodology of the study. Detailed descriptions on compounds or devices are not mandatory, one can even choose to register a study with for example “compound X”.</p>"
            ],
            [
                "category" => "Protocols",
                "title" => "My study was rejected, am I able to re-submit it?",
                "content" => "<p>No. We will not reject a record unless it clearly does not meet our inclusion criteria. You are not able to re-submit a rejected record. You will receive and automatic email if your record is rejected. Your record will also be flagged as “rejected” in the “View my previous submissions” section. If you have any further questions, please contact us at <a href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a>.</p>"
            ],
            [
                "category" => "Protocols",
                "title" => "I am unable to edit a record that I have published?",
                "content" => "<p>Once a record is published it remains locked. Any revisions or updates that you want to make to that record must be done by creating an updated version. Click the “Update” button next to the record to start an update.</p>"
            ],
            [
                "category" => "Other",
                "title" => "How do I contact preclinicaltrials.eu if I have an issue?",
                "content" => "<p>If you have questions or need assistance relating to an update or in general, e-mail <a href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a>.</p>"
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
