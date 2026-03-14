import { Button as BaseButton, type ButtonProps } from "@base-ui/react/button";
import { cn } from "../../utils/cn";

type Props = {} & ButtonProps;

const Button = ({ className, children, ...props }: Props) => {
  return (
    <BaseButton
      className={cn(
        "inline-flex gap-1 h-12 rounded-xl bg-zinc-800 px-6 text-white items-center [&>svg]:size-5",
        className,
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
};

export default Button;
