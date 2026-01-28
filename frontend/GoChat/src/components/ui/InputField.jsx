export function InputField({
  id,
  label,
  type,
  onChange,
  value,
  labelClassName,
  inputClassName,
  name,
}) {
  return (
    <div className="flex flex-col gap-2 my-2">
      <label className={`text-sm text-gray-700 ${labelClassName}`} htmlFor={id}>
        {label}
      </label>
      <input
        className={`px-4 py-1.5 outline-2 outline-cyan-600/50 focus:outline-offset-1 focus:outline-cyan-600 rounded-full text-sm ${inputClassName}`}
        id={id}
        name={name}
        type={type}
        onChange={onChange}
        value={value}
      />
    </div>
  );
}
