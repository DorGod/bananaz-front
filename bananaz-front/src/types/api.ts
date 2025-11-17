export type ImageItem = {
  id: string;
  url: string;
  createdByName: string;
};

export type ImageThread = {
  id: string;
  imageId: string;
  x: number;
  y: number;
  comment: string;
  createdByName: string;
};
