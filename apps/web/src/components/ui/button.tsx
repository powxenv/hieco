import { Button as BaseButton, type ButtonProps } from "@base-ui/react/button";
import { cn } from "../../utils/cn";

type Props = {} & ButtonProps;

const Button = ({ className, children, ...props }: Props) => {
  return (
    <BaseButton className={cn("", className)} {...props}>
      {children}
    </BaseButton>
  );
};

export default Button;
