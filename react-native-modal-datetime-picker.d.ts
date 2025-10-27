declare module "react-native-modal-datetime-picker" {
  import { ComponentType } from "react";

  type Mode = "date" | "time" | "datetime";

  type Props = {
    isVisible: boolean;
    mode?: Mode;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
    // allow other props
    [key: string]: any;
  };

  const DateTimePickerModal: ComponentType<Props>;
  export default DateTimePickerModal;
}
