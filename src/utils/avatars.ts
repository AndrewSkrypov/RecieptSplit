export const avatarUrls = [
    '/avatars/avatar1.jpg',
    '/avatars/avatar2.jpg',
    '/avatars/avatar3.jpg',
    '/avatars/avatar4.jpg',
    '/avatars/avatar5.jpg',
    '/avatars/avatar6.jpg',
    '/avatars/avatar7.jpg',
    '/avatars/avatar8.jpg',
  ];
  
  export const getRandomAvatar = (): string => {
    const index = Math.floor(Math.random() * avatarUrls.length);
    return avatarUrls[index];
  };
  