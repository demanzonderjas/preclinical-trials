<?php

namespace App\Services\Import;

/**
 * A file that cannot be imported. The message is shown to the researcher as is, so it says
 * what is wrong with the file and what to do about it.
 */
class ImportException extends \InvalidArgumentException {}
