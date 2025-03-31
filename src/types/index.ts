type PictureData = {
  height: number;
  is_silhouette: boolean;
  url: string;
  width: number;
};

type Picture = {
  data: PictureData;
};

export type UserProfile = {
  id: string;
  name: string;
  picture: Picture;
};
