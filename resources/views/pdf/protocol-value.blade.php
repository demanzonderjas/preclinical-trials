@if ($cell['table'])
    <table class="data" style="{{ $class ? 'margin-left: 8mm; width: auto;' : '' }}">
        <tr>@foreach ($cell['table']['headers'] as $header)<th>{{ $header }}</th>@endforeach</tr>
        @foreach ($cell['table']['rows'] as $row)
            <tr>@foreach ($row as $value)<td>{{ $value }}</td>@endforeach</tr>
        @endforeach
    </table>
@elseif ($cell['images'])
    <div class="{{ $class }} muted">{{ $cell['images'] }} {{ $cell['images'] === 1 ? 'image' : 'images' }}, see the online record</div>
@elseif ($cell['html'] ?? null)
    <div class="{{ $class }} rich">{!! $cell['html'] !!}</div>
@elseif ($cell['text'] !== null)
    <div class="{{ $class }}">{{ $cell['text'] }}</div>
@else
    <div class="{{ $class }} empty">Not provided</div>
@endif
