/* =========================================================
   STORAGE
   BISMILLAH PERFUMES
   ========================================================= */

import {
    requireLogin
} from "./auth.js";

import { supabase } from "./supabase.js";


/* =========================================================
   UPLOAD IMAGE
   ========================================================= */

async function uploadImage(
    file,
    bucket = "product-images"
) {

    if (!file) {

        throw new Error(
            "No image selected."
        );

    }


    if (
        !(await requireLogin())
    ) {

        throw new Error(
            "You must be logged in."
        );

    }


    /*
       Create a unique filename.
    */

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const filename =
        `${crypto.randomUUID()}.${extension}`;


    const path =
        filename;


    const {
        error
    } =
        await supabase.storage
            .from(bucket)
            .upload(
                path,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type

                }
            );


    if (error)
        throw error;


    const {
        data
    } =
        supabase.storage
            .from(bucket)
            .getPublicUrl(
                path
            );


    return data.publicUrl;

}


/* =========================================================
   DELETE IMAGE
   ========================================================= */

async function deleteImage(
    bucket,
    path
) {

    if (
        !(await requireLogin())
    )
        return;


    const {
        error
    } =
        await supabase.storage
            .from(bucket)
            .remove([
                path
            ]);


    if (error)
        throw error;

}


/* =========================================================
   GLOBAL
   ========================================================= */

window.uploadImage =
    uploadImage;


window.deleteImage =
    deleteImage;


export {
    uploadImage,
    deleteImage
};