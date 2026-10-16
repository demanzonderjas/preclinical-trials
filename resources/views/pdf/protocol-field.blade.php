<div class="field">
    <div class="label"><span class="number">{{ $field['number'] }}</span>{{ $field['label'] }}</div>
    @include('pdf.protocol-value', ['cell' => $field, 'class' => 'value'])
    @foreach ($field['children'] as $child)
        <div class="sub">
            <div class="label">{{ $child['label'] }}</div>
            @include('pdf.protocol-value', ['cell' => $child, 'class' => ''])
        </div>
    @endforeach
</div>
