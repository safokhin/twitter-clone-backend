import express from 'express';
// const cloudinary = require('cloudinary').v2;
import cloudinary from '../core/cloudinary';


class UploadFileController {

  async upload(req: express .Request, res: express.Response): Promise<void> {
    const file = req.file;

    await cloudinary.v2.uploader.upload_stream({ resource_type: 'auto' }, (error: any, result: any) => {
      console.log(error, result)
      if(error || !result) {
        return res.status(500).json({
          status: 'error',
          message: error || 'upload error'
        })
      }

      res.status(201).json({
        url: result.url,
        size: Math.round(result.bytes / 1024),
        height: result.height,
        width: result.width,
      });
    }).end(file.buffer)
  }


}

export const UploadFileCtrl = new UploadFileController();
