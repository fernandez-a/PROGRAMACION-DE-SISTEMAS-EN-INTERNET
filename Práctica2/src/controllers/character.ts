import { Request, Response, NextFunction } from 'express';
import Character from '../models/character';
import moongose from 'mongoose';
import { stat } from 'fs';

const serverCheck = async (req: Request, res: Response, next: NextFunction) => {
    if (res.statusCode === 200) {
        return res.json({
            Status: res.statusCode,
            Body: "OKProgramacion-I"
        })
    }
    else {
        return res.json({
            Status: res.statusCode,
            Body: "Not found"
        })
    }
};


const getAllCharacters = async (req: Request, res: Response, next: NextFunction) => {
    let allCharacters = await Character.find();
    return res.json(
        {
            Status: res.statusCode,
            Body: allCharacters
        });
};

const getCharacter = async (req: Request, res: Response, next: NextFunction) => {
    let id: string = req.params.id;
    let character = await Character.findOne({ id: id });
    if (character === null) {
        return res.json({
            Status: 400,
            Body: "Not found"
        })
    }
    else {
        return res.json({
            Status: res.statusCode,
            Body: character
        })
    }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    let id: string = req.params.id;
    let character = await Character.findOne({ id: id });
    if (character === null) {
        return res.json({
            Status: 400,
            Body: "Not Found"
        });
    }
    else {
        if (character['status'] === "Dead") {
            let character_update = await Character.updateOne({ id: id }, { status: "Alive" });
            return res.json({
                Status: 200,
                Body: await Character.findOne({ id: id })
            });
        }
        else {
            let character_update = await Character.updateOne({ id: id }, { status: "Dead" });
            return res.json({
                Status: 200,
                Body: await Character.findOne({ id: id })
            });
        }
    }

}
const deleteCharacter = async (req: Request, res: Response, next: NextFunction) => {
    let id_: string = req.params.id;
    let character = await Character.findOne({ id: id_ });
    if (character === null) {
        return res.json({
            Status: 400,
            Body: "Not found"
        })
    }
    else {
        let character = await Character.deleteOne({ id: id_ });
        return res.json({
            Status: res.statusCode,
            Body: "OK"
        })
    }
}



export default { serverCheck, getAllCharacters, getCharacter, updatePost, deleteCharacter };
