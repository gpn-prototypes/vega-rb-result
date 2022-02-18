export enum ModalMode {
  initial = 'initial',
  loading = 'loading',
  cancel = 'cancel',
}

export interface ModalContentProps {
  handleCloseContent: () => void;
  setModalContent: (contentType: ModalMode) => void;
  isFileWithImg: boolean;
  setFileWithImg: (isLarge: boolean) => void;
}
