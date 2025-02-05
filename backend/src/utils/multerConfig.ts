import multer from 'multer';
import path from 'path';

// Set up storage untuk gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Menyimpan gambar di folder 'uploads'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file dengan timestamp
  }
});

// Filter file agar hanya gambar yang bisa di-upload
const fileFilter = (req: any, file: any, cb: any) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Inisialisasi multer dengan konfigurasi di atas
const upload = multer({ storage, fileFilter });

export default upload;
