const { response } = require("express");
const fs = require("fs");
const cloudinary = require('cloudinary').v2;
const path = require('path');
const {fileUpload} = require('./../helpers/file-upload');
const {returnModel} = require('./../helpers/db-model');


const allowExtensionsImages = ['png', 'jpg', 'jpeg', 'gif'];
const allowExtensionsText = ['txt', 'md'];
// const allowExtension = [allowExtensionsImages ,allowExtensionsText];

const {User, Product} = require('./../models');


cloudinary.config(process.env.CLOUDINARY_URL)


const uploadFiles = async (req, res = response) => {

    try{
        const name = await fileUpload(req.files, allowExtensionsImages, '');
        res.json({name});
    } catch(msg){
        res.status(400).json({msg});
    }
    
}

/* prueba en local
const imageUpdate = async (req, res = response) => {
    
    const {id, collection} = req.params;
    try{
        const model = await returnModel(collection, id);
        // Limpiar imagenes previas
    
        if(model.img){
            const imgPath = path.join(__dirname, '../uploads', collection, model.img);
            if(fs.existsSync(imgPath)){
                fs.unlinkSync(imgPath);
            }
        };
    
        model.img = await fileUpload(req.files, allowExtensionsImages, collection);
        await model.save({new: true});
    
        res.json({model});

    }catch(msg){
        if(msg==='500'){
            res.status(500).json({msg: `collection: aun no validada`});
        }else{
            res.status(400).json({msg});
        }
    }
};
*/

const imageUpdateCloudinary = async (req, res = response) => {
    
    const {id, collection} = req.params;
    
    try{
        const {tempFilePath} = req.files.fileUp;
        const model = await returnModel(collection, id);
        
        if(model.img){
            const nameArr = model.img.split('/');
            const name    =  nameArr[nameArr.length-1];
            const [public_id] = name.split('.');
            cloudinary.uploader.destroy(public_id);
        }
        const result  = await cloudinary.uploader.upload(tempFilePath);
        model.img = result.secure_url;
        await model.save({new: true});

        res.json({
            msg: 'recived',
            result
        });

    }catch(err){
        console.log(err);
        res.json({err});
    }
};


const getImgId = async (req, res=response) => {
    try{
        const {id, collection} = req.params;
        const model = await returnModel(collection, id);
        
        if(model.img){
            const imgPath = path.join(__dirname, '../uploads', collection, model.img);
            if(fs.existsSync(imgPath)){
                return res.sendFile(imgPath);
            } else{
                const imgUndiscovered = path.join(__dirname, '../assets/no-image.jpg');
                return res.sendFile(imgUndiscovered);
            }
        }

        res.json({msg: `no existe registro de imagen para la coleccion de este: ${collection}`});
    }catch(msg){
        if(msg==='500'){
            res.status(500).json({msg: `collection: aun no validada`});
        }else{
            res.status(400).json({msg});
        }
    }
    
}

module.exports = {
    uploadFiles,
    // imageUpdate,
    getImgId,
    imageUpdateCloudinary,
}