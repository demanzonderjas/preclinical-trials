<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Rich text from the admin editor, reduced to the tags the editor makes. The public site
 * renders it as HTML, so scripts, styles, event handlers and javascript: links are dropped.
 */
class Html
{
    private const TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'hr'];

    private const ATTRIBUTES = ['a' => ['href', 'target', 'rel'], 'img' => ['src', 'alt']];

    /** Elements removed with everything inside them. */
    private const DROP = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'svg', 'math', 'template'];

    public static function clean(?string $html): string
    {
        if (trim((string) $html) === '') {
            return '';
        }

        $document = new DOMDocument();
        libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="utf-8"?><div id="root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
        libxml_clear_errors();
        $root = $document->getElementById('root');
        self::walk($root);

        $out = '';
        foreach ($root->childNodes as $child) {
            $out .= $document->saveHTML($child);
        }

        return trim($out);
    }

    private static function walk(DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMElement) {
                $tag = strtolower($child->tagName);
                if (in_array($tag, self::DROP, true)) {
                    $child->parentNode->removeChild($child);

                    continue;
                }
                self::walk($child);
                if (! in_array($tag, self::TAGS, true)) {
                    // Keep the text of unknown tags (div, span, font…), not the tag.
                    while ($child->firstChild) {
                        $child->parentNode->insertBefore($child->firstChild, $child);
                    }
                    $child->parentNode->removeChild($child);

                    continue;
                }
                foreach (iterator_to_array($child->attributes) as $attribute) {
                    $name = strtolower($attribute->name);
                    $allowed = in_array($name, self::ATTRIBUTES[$tag] ?? [], true);
                    if (! $allowed || (in_array($name, ['href', 'src'], true) && ! self::safeUrl($attribute->value))) {
                        $child->removeAttribute($attribute->name);
                    }
                }
                if ($tag === 'a' && $child->getAttribute('target') === '_blank') {
                    $child->setAttribute('rel', 'noopener noreferrer');
                }
            } elseif ($child->nodeType === XML_COMMENT_NODE) {
                $child->parentNode->removeChild($child);
            }
        }
    }

    private static function safeUrl(string $url): bool
    {
        $url = trim(preg_replace('/[\x00-\x20]+/', '', $url));

        return (bool) preg_match('#^(https?:|mailto:|/(?!/)|\#)#i', $url);
    }
}
