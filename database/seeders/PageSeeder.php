<?php

namespace Database\Seeders;

use App\Models\Page;
use Exception;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $pages = [
            [
                "title" => "PreclinicalTrials.eu",
                "subtitle" => "International register of preclinical trial protocols",
                "menu_title" => "Homepage",
                "slug" => "/",
                "content_blocks" => [
                    [
                        "type" => "text",
                        "content" => "<p>Preclinicaltrials aims to provide a comprehensive listing ofpreclinical animal study protocols. Preferably registered atinception in order to increase transparency, help avoid duplication,and reduce the risk of reporting bias by enabling comparison of thecompleted study with what was planned in the protocol. Registration of your study requires you to create an account that is:</p><ul><li>Anonymous</li><li>Free of charge</li><li>Has an optional embargo period</li></ul>"
                    ],
                    [
                        "type" => "text",
                        "content" => "<p>This register is web-based, open to all types of animal studies and freelyaccessible and searchable to all with a preclinicaltrials.eu account. The registration form is designed by experts on preclinical animal studies andpreclinical evidence synthesis. Please join us and create a user account,this will provide access to the database and enables you to register your preclinical trial. Contact us at <a href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a></p>"
                    ]
                ]
            ],
            [
                "title" => "About PCT",
                "subtitle" => "",
                "menu_title" => "About PCT",
                "slug" => "/about-pct",
                "content_blocks" => [
                    [
                        "type" => "text",
                        "content" => "<h3>Goals and aims of Preclinicaltrials.eu</h3><p>Preclinicaltrials.eu aims to provide a comprehensive overview of all animal studies, including those that might otherwise remain unpublished. By(prospective) registration of animal studies we aim to:</p><ul><li>Increase transparency</li><li>Avoid unnecessary duplication of animal studies</li><li>Reduce reporting bias, such as publication bias and bias induced by selective outcome reporting, p-hacking and HARKing</li><li>Increase data sharing, by</li><ul><li>allowing fellow researchers and reviewers to access information on the study design, which is often lacking in publications</li><li>provide a platform to share details and data of otherwise unpublished animal studies</li></ul><li>Create opportunities for collaborative research</li></ul><h3>Which studies can you register on Preclinicaltrials.eu?</h3><p>The register is open for all animal studies. We especially encourage researchers to register their confirmatory studies. This register is created with support of the Transnational AllianCe for regenerative Therapies In CardiovascularSyndromes (TACTICS) alliance. Therefore the original focus is on the field of cardiac regenerative therapy. The design of the registration form is discussed with members of the TACTICS alliance. However, the register is open for studies from all fields of biomedical science. Furthermore, registration is not limited to a certain country or continent.</p>"
                    ]
                ]
            ],
            [
                "title" => "Team",
                "subtitle" => "",
                "menu_title" => "Team",
                "slug" => "/about-pct/team",
                "content_blocks" => []
            ],
            [
                "title" => "Advisory board",
                "subtitle" => "",
                "menu_title" => "Advisory board",
                "slug" => "/about-pct/advisory-board",
                "content_blocks" => []
            ],
            [
                "title" => "Background information",
                "subtitle" => "",
                "menu_title" => "Background information",
                "slug" => "/about-pct/background-information",
                "content_blocks" => [
                    [
                        "type" => "text",
                        "content" => "<h3>Relevant literature</h3><ul><li>Kimmelman et al – Should preclinical studies be registered?DOI:10.1038/nbt.2261</li><li>Jansen of Lorkeers SJ – All preclinical trials should be registered in advance in an online registry</li><li>Chamuleau SAJ - Translational research in cardiovascular repair: A call fora paradigm shift</li></ul><strong>Preclinical systematic reviews and meta-analysis</strong><p>The CAMARADES framework provides support for groups involved in preclinical systematic reviews and meta-analysis.</p><p>The Systematic Review Center for Laboratory animal Experimentation (SYRCLE)supports and trains researchers working with preclinical systematic reviews.</p><h3>Registries for clinical trials</h3><p>There are multiple registrations for clinical trials. The World HealthOrganisation provides additional information on these clinical trials.</p><p>The Dutch parliament passed a motion on July 3rd 2018 stating that prospective registration of animal studies and sharing of data should become the norm.</p><p>Internationally, we are supported by the TACTICS consortium and the EuropeanSociety of Cardiology working group on cardiovascular regenerative and reparative medicine (ESC WG CARE). We plan to expand this line of international support.</p><h3>Support for prospective registration of confirmatory animal studies</h3><p>In The Netherlands we are now supported by funders, research institutes and research groups. The Royal Netherlands Academy of Arts and Sciences and theNetherlands Organization for Scientific Research are involved to guarantee permanent access to the database. Internationally, we are supported by theTACTICS consortium and the European Society of Cardiology working group on cardiovascular regenerative and reparative medicine (ESC WG CARE). We plan to expand this line of international support.</p>"
                    ]
                ]
            ],
            [
                "title" => "Help",
                "subtitle" => "",
                "menu_title" => "Help",
                "slug" => "/help",
                "content_blocks" => []
            ],
            [
                "title" => "News",
                "subtitle" => "Updates including congresses and workshops where preclinicaltrials.eu is involved",
                "menu_title" => "News",
                "slug" => "/news",
                "content_blocks" => []
            ],
            [
                "title" => "Contact",
                "subtitle" => "",
                "menu_title" => "Contact",
                "slug" => "/contact",
                "content_blocks" => [
                    [
                        "type" => "text",
                        "content" => "<p>For more information you can also contact us at <a href='mailto:info@preclinicaltrials.eu'>info@preclinicaltrials.eu</a></p>"
                    ]
                ]
            ],
            [
                "title" => "Disclaimer",
                "subtitle" => "Terms and Conditions",
                "menu_title" => "Disclaimer",
                "slug" => "/disclaimer",
                "content_blocks" => [
                    [
                        "type" => "text",
                        "content" => "<p>The information contained in this website is for general information purposes only and the safety and validity of a study on preclinicaltrials.eu is the responsibility of the study sponsor and investigator. The information is provided by preclinicaltrials.eu and while we endeavour to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.</p><p>In no event will preclinicaltrials.eu or its developers be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.Through this website you are able to link to other websites which are not under the control of preclinicaltrials.eu. While we make efforts to ensure the links are correct and up to date, we have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them and you use those links at your own risk.</p><p>Every effort is made to keep the website up and running smoothly. However, preclinicaltrials.eu takes no responsibility for, and will not be liable for, the website being unavailable due to technical issues.</p>"
                    ]
                ]
            ],
            [
                "title" => "Ambassadors",
                "subtitle" => "",
                "menu_title" => "Ambassadors",
                "slug" => "/about-pct/ambassadors",
                "content_blocks" => [
                    [
                        "type" => "text",
                        "content" => ""
                    ]
                ]
            ]
        ];

        foreach ($pages as $pageData) {
            $page = new Page();
            $page->title = $pageData["title"];
            $page->subtitle = $pageData["subtitle"];
            $page->menu_title = $pageData["menu_title"];
            $page->slug = $pageData["slug"];
            $page->content_blocks = $pageData["content_blocks"];
            $page->save();
        }
    }
}
