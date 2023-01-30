import express from 'express';
import controller from '../controllers/character';

const router = express.Router();

router.get('/status', controller.serverCheck);
router.get('/characters', controller.getAllCharacters);
router.get('/character/:id', controller.getCharacter);
router.put('/switchstatus/:id', controller.updatePost);
router.delete('/character/:id', controller.deleteCharacter);
export = router;