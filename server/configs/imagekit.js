import ImageKit from "imagekit";


var imagekit=new ImageKit({
      publicKey:process.env.IMAGEKIT_PUBLIC_KEY || 'placeholder',
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY || 'placeholder',
    urlEndpoint:process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/placeholder'

});
export default imagekit;