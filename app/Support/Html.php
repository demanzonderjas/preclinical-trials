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

    /** Long protocol answers: what the protocol form's answer editor makes. */
    private const ANSWER_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'sup', 'sub', 'ul', 'ol', 'li', 'a'];

    /** A style or title block some editors paste as escaped text ("&lt;style&gt;a { … }&lt;/style&gt;"). */
    public const ESCAPED_HEAD = '/&lt;(style|title)\b.*?&lt;\/\1\s*&gt;/is';

    /** Elements removed with everything inside them. */
    private const DROP = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'svg', 'math', 'template'];

    public static function clean(?string $html): string
    {
        return self::sanitize($html, self::TAGS, false);
    }

    /**
     * A long answer from the protocol form, the ILES import or the legacy editor: paragraphs,
     * lists, bold, italic, underline, superscript, subscript ("10<sup>6</sup> cells") and
     * absolute links. Everything else keeps its text only.
     */
    public static function answer(?string $html): string
    {
        return self::sanitize($html, self::ANSWER_TAGS, true);
    }

    private static function sanitize(?string $html, array $tags, bool $answer): string
    {
        if (trim((string) $html) === '') {
            return '';
        }

        $html = preg_replace(self::ESCAPED_HEAD, '', $html);
        $document = new DOMDocument;
        libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="utf-8"?><div id="root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
        libxml_clear_errors();
        $root = $document->getElementById('root');
        self::walk($root, $tags, $answer);

        $out = '';
        foreach ($root->childNodes as $child) {
            $out .= $document->saveHTML($child);
        }

        return trim($out);
    }

    private static function walk(DOMNode $node, array $tags, bool $answer): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMElement) {
                $tag = strtolower($child->tagName);
                // Word's comment markers ("[E1]") link to the comments, which are not kept.
                $wordComment = $tag === 'a' && (str_starts_with($child->getAttribute('href'), '#_mso') || str_contains($child->getAttribute('class'), 'msocomanchor'));
                if (in_array($tag, self::DROP, true) || $wordComment) {
                    $child->parentNode->removeChild($child);

                    continue;
                }
                self::walk($child, $tags, $answer);
                if ($answer && ! in_array($tag, $tags, true) && self::asParagraph($child, $tag)) {
                    continue;
                }
                if (! in_array($tag, $tags, true)) {
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
                    if (! $allowed || (in_array($name, ['href', 'src'], true) && ! self::safeUrl($attribute->value, ! $answer))) {
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

    /**
     * Answers have no headings, tables or block quotes: a heading or a table row becomes a
     * paragraph, and table cells in a row are separated by " · ".
     */
    private static function asParagraph(DOMElement $element, string $tag): bool
    {
        if (in_array($tag, ['td', 'th'], true)) {
            if ($element->previousSibling) {
                $element->parentNode->insertBefore($element->ownerDocument->createTextNode(' · '), $element);
            }

            return false; // unwrapped as any unknown tag
        }
        $blocks = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', 'caption', 'div', 'blockquote', 'section', 'article'];
        if (! in_array($tag, $blocks, true)) {
            return false;
        }
        foreach ($element->childNodes as $child) {
            if ($child instanceof DOMElement && in_array(strtolower($child->tagName), ['p', 'ul', 'ol', 'li'], true)) {
                return false; // already holds blocks: keep those, drop the wrapper
            }
        }
        $paragraph = $element->ownerDocument->createElement('p');
        while ($element->firstChild) {
            $paragraph->appendChild($element->firstChild);
        }
        $element->parentNode->replaceChild($paragraph, $element);

        return true;
    }

    private static function safeUrl(string $url, bool $relative = true): bool
    {
        $url = trim(preg_replace('/[\x00-\x20]+/', '', $url));

        return (bool) preg_match($relative ? '#^(https?:|mailto:|/(?!/)|\#)#i' : '#^(https?://|mailto:)#i', $url);
    }
}
