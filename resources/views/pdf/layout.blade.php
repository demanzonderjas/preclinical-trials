<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>@yield('title')</title>
<style>
    /* dompdf: block layout and tables only. DejaVu Sans covers Greek letters and symbols. */
    @page { margin: 26mm 20mm 24mm; }
    body { font-family: "DejaVu Sans", sans-serif; font-size: 9.5pt; line-height: 1.5; color: #323742; }
    header.page { position: fixed; top: -16mm; left: 0; right: 0; font-size: 10pt; font-weight: bold; }
    header.page .eu { color: #558F99; }
    header.page td.right { text-align: right; font-weight: normal; color: #585F6F; font-size: 8pt; }
    footer.page { position: fixed; bottom: -14mm; left: 0; right: 0; font-size: 7.5pt; color: #798399; border-top: 0.5pt solid #D2D6DD; padding-top: 2mm; }
    footer.page td.right { text-align: right; }
    header.page td, footer.page td { padding: 0; }
    .eyebrow { font-size: 7.5pt; letter-spacing: 1.5pt; text-transform: uppercase; color: #585F6F; font-weight: bold; }
    h1 { font-size: 18pt; line-height: 1.2; margin: 2mm 0 0; }
    h2 { font-size: 12.5pt; margin: 9mm 0 3mm; padding-bottom: 1.5mm; border-bottom: 1pt solid #323742; }
    h3 { font-size: 10.5pt; margin: 6mm 0 2mm; color: #395F66; }
    .muted { color: #585F6F; }
    .pct-id { font-size: 22pt; font-weight: bold; letter-spacing: 1pt; }
    table { width: 100%; border-collapse: collapse; }
    table.record td { padding: 1.6mm 0; border-bottom: 0.5pt solid #E6F0F1; vertical-align: top; }
    table.record td.term { width: 42mm; color: #585F6F; }
    table.data { margin-top: 1.5mm; }
    table.data th { text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1pt; color: #585F6F; background: #F3F7F8; padding: 1.5mm 2mm; }
    table.data td { padding: 1.5mm 2mm; border-top: 0.5pt solid #E6F0F1; }
    .field { margin: 0 0 4mm; page-break-inside: avoid; }
    .field .label { font-weight: bold; }
    .field .number { color: #798399; display: inline-block; width: 8mm; }
    .field .value { margin-left: 8mm; white-space: pre-line; }
    .field .sub { margin: 1.5mm 0 0 8mm; }
    .field .sub .label { font-weight: bold; font-size: 8.5pt; color: #585F6F; }
    .empty { color: #798399; font-style: italic; }
    .note { background: #E6F0F1; padding: 3mm 4mm; margin-top: 6mm; font-size: 8.5pt; }
</style>
</head>
<body>
{{-- Tables, not floats: dompdf narrows every later line around a float in a fixed box. --}}
<header class="page"><table><tr><td>preclinicaltrials<span class="eu">.eu</span></td><td class="right">@yield('header-right')</td></tr></table></header>
<footer class="page"><table><tr><td>© {{ now()->year }} PreclinicalTrials.eu · UMC Utrecht, Utrecht, the Netherlands</td><td class="right">Generated {{ $generated }}</td></tr></table></footer>
@yield('content')
</body>
</html>
