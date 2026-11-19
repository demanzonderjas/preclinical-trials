<?php

namespace App\Console\Commands;

use App\Content\TypeScript;
use Illuminate\Console\Command;

class PageContentTypes extends Command
{
    protected $signature = 'page-content:types {--check : Only check that the file is up to date}';

    protected $description = 'Write the TypeScript types of the editable pages (resources/js/types/page-content.ts)';

    public function handle(): int
    {
        $path = base_path(TypeScript::PATH);
        $types = TypeScript::generate();
        if ($this->option('check')) {
            if ((is_file($path) ? file_get_contents($path) : '') !== $types) {
                $this->error(TypeScript::PATH.' is out of date: run php artisan page-content:types');

                return self::FAILURE;
            }
            $this->info(TypeScript::PATH.' is up to date');

            return self::SUCCESS;
        }
        file_put_contents($path, $types);
        $this->info('Wrote '.TypeScript::PATH);

        return self::SUCCESS;
    }
}
