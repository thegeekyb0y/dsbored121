export const AVATARS = [
  { id: "cat1", src: "/avatars/avatar0.jpg", label: "Cat" },
  { id: "cat2", src: "/avatars/avatar1.jpg", label: "Cat" },
  { id: "cat3", src: "/avatars/avatar2.jpg", label: "Cat" },
  { id: "cat4", src: "/avatars/avatar3.jpg", label: "Cat" },
  { id: "greenbear1", src: "/avatars/avatar4.jpg", label: "Pookie" },
  { id: "greenbear2", src: "/avatars/avatar5.jpg", label: "Pookie" },
  { id: "greenbear3", src: "/avatars/avatar6.jpg", label: "Pookie" },
  { id: "mice", src: "/avatars/avatar7.jpg", label: "Mice" },
  { id: "pikachu", src: "/avatars/avatar8.jpg", label: "Pikachu" },
  { id: "pikachu2", src: "/avatars/avatar9.jpg", label: "Pikachu" }, // Renamed ID to be unique
  { id: "chilling", src: "/avatars/avatar10.jpg", label: "Chilling" },
  { id: "dawg", src: "/avatars/avatar11.jpg", label: "German Shephard" },
  { id: "cat_cute", src: "/avatars/avatar12.jpg", label: "cutie" }, // Renamed ID to be unique
];

export const getAvatarById = (id: string | null) => {
  return AVATARS.find((a) => a.id === id);
};
