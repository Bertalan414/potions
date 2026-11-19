const express = require("express");
const { eq, like } = require("drizzle-orm");

const db = require("../db/db");
const { users, potions } = require("../db/schema");

const router = express.Router();


router.get("/", async (req,res)=>{
    try {
        const entries= await db.select().from(potions)
        const {name, effect}=+req.query;

        let isDangerous=req.query.isDangerous;

        if(!name||!effect||isDangerous===undefined)
        {
            const allpotions=await db
            .select()
            .from(potions)
            return res.status(200).json(allpotions)
        }

        isDangerous=isDangerous==="true";
        const queryPotions=await db
        .select()
        .from(potions)
        .where(
            and(
                like(potions.name, `%${name}%`), 
                like(potions.effect, `%${effect}%`),
                eq(potions.isDangerous, isDangerous)
            ))
        return res.status(200).json({
            success:true,
            potion: queryPotions,
        })
    } catch (err) {
        return res.status(404).json({
            success:false,
            message:"ez nem sikerult nga",
        });
    }
})

router.get("/:id", async (req,res)=>{
    try {
        const [entry]=await db
        .select()
        .from(potions)
        .where(eq(potions.id, +req.params.id));
        return res.status(200).json({
            succes:true,
            potion:entry
        })
    } catch (err) {
        return res.status(404).json({
            success:false,
            message:"ez nem sikerult nga",
        });
    }
})

router.post("/", async (req,res)=>{
    try {
        const {name,effect,isDangerous} =req.body;
        if(!name)
            return res.status(400).json({
                success:false,
                message:"The name field required",
            })
        if(!effect)
            return res.status(400).json({
                success:false,
                message:"The effect field required",
            })
        if(isDangerous===undefined)
            return res.status(400).json({
                success:false,
                message:"The isDangerous field required",
            })

        await db
        .insert(potions)
        .values({
            name:name,
            effect:effect,
            isDangerous:isDangerous,
        })
        return res.status(201).json({
            success:true,
            message:"potion was successfully created",
        })
    } catch (err) {
        return res.status(400).json({
            success:false,
            message:"internal server error",
        })
    }
})
router.delete("/:id", async (req,res)=>{
    const [existing] =await db
    .select()
    .from(potions)
    .where(eq(potions.id, +req.params.id))
    
    if(!existing){
        return res.status(404).json({
            success:false,
            message:"no potion found with this id",
        })
    }
    await db
    .delete(potions)
    .where(eq(potions.id,+req.params.id))
    return res.status(200).json({
        message:"potion deleted successfully",
    })
})

router.put("/:id", async (req,res)=>{
    try {
        const{name, effect, isDangerous}=req.body;

        const [entry]=await db
        .select()
        .where(eq(potions.id,+req.params.id))

        if(!entry){
            return res.status(404).json({
                success:false,
                message:"no potion found with this id",
            })
        }

        await db
        .update(potions)
        .set({name, effect, isDangerous})
        .where(eq(potions.id,+req.params.id))
    
        return res.status(200).json({
            succes:true,
            message:"Potion updated successfully",
        })

    } catch (err) {
        return res.status(400).json({
            succes:false,
            message:"Potion unfortunately not updated"
        })
    }
})

module.exports={
    router
}