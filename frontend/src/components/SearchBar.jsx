const TEACHER_NAME_LABEL = String.fromCharCode(
  0xad50,
  0xc0ac,
  0x20,
  0xc774,
  0xb984
);

const TEACHER_NAME_PLACEHOLDER = String.fromCharCode(
  0xc120,
  0xc0dd,
  0xb2d8,
  0x20,
  0xc774,
  0xb984,
  0xc744,
  0x20,
  0xc785,
  0xb825,
  0xd558,
  0xc138,
  0xc694
);

export default function SearchBar({
  value,
  onChange,
  placeholder = TEACHER_NAME_PLACEHOLDER
}) {
  return (
    <label className="field">
      <span>{TEACHER_NAME_LABEL}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
