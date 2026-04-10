
type CheckboxWithLinksProps = {
  label: string;
  id?: string;
  termsHref?: string;
  privacyHref?: string;
  checked?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function CheckboxWithLinks({
  label,
  termsHref = "#terminos",
  privacyHref = "#privacidad",
  id = "terms",
  checked,
  required,
  onChange,
}: CheckboxWithLinksProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        checked={checked}
        required={required}
        onChange={onChange}
      />
      <label htmlFor={id} className="text-sm text-gray-600 leading-tight">
        {label}{" "}
        <a href={termsHref} className="text-teal-600 hover:text-teal-700 underline">
          Términos de uso
        </a>{" "}
        y la{" "}
        <a href={privacyHref} className="text-teal-600 hover:text-teal-700 underline">
          Política de privacidad
        </a>
      </label>
    </div>
  );
}
