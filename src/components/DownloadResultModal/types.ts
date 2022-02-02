export interface ModalContentProps {
  handleCloseContent: () => void;
  setModalContent: (contentType: string) => void;
  isFileWithImg: boolean;
  setFileWithImg: (isLarge: boolean) => void;
}
