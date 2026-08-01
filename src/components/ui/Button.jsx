import styles from "./Button.module.css";

export default function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  children,
  className,
  type = "button",
  ...rest
}) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
}
