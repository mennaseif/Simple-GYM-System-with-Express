 const { json } = require('body-parser')
const express = require('express')
 const app = express()
 const fs = require('fs')

 let member= JSON.parse(fs.readFileSync('member.json'))
 let trainer= JSON.parse(fs.readFileSync('trainer.json'))

 app.use(express.json())

 //////////////////////////////////////////////Statistics APIs//////////////////////////////////////////////////////////////////////
 //1- Get all revenues of all members.
 app.get('/costs', (req, res) =>{
    let cost=0;
    for(let i=0; i < member.length; i++){
        cost+= member[i].Membership.Cost
    }
    res.json(cost);
  })
 /////////////////////////////////////////////////////
 //2-2- Get the revenues of a specific trainer.
 app.get('/trainerCost/:id', (req, res) =>{
    let cost=0;
    for(let i=0; i < member.length; i++){
        if(member[i].TrainerId == req.params.id){
            cost+= member[i].Membership.Cost
        }
    }
      res.json(cost)})
 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 ///////////////////////////////////////////////Member’s APIs////////////////////////////////////////////////////////////////////
 //1- Add Member (must be unique)
 app.post('/member',express.json(),(req, res) => {
    let newMember= req.body;
    let existMember = member.find(member => member.NationalId == newMember.NationalId)
    if(existMember){
        res.json('Member is already exist');
    }
    else{
        member.push(newMember)
        fs.writeFileSync('member.json',JSON.stringify(member))
        res.json("added")
    }
  })
 ///////////////////////////////////////////////////////
 //2- Get all Members and Member’s Trainer
  app.get('/member', (req, res) =>{

    let allMembers= member.map(member =>{
        let allTrainers= trainer.find(trainer => trainer.id == member.TrainerId)
        return {member, allTrainers}
    })
    res.json(allMembers)
  })
 ////////////////////////////////////////////////////
 //3- Get a specific Member (if his membership expired return “this member is not allowed to enter the gym”)
  app.get('/member/:id', (req, res) =>{
    let members = member.find(member => member.id == req.params.id)
    if(!members){
        res.json("Member is not found")
    }
    else if (new Date(members.Membership.To) < new Date()){
        res.json("Member is not allowed to enter the gym")
    }
    else{
        res.json("Member is allowed to enter the gym")
    }
  })     
 ////////////////////////////////////////////////////
 //4- Update Member (name, membership, trainer id)
 app.put('/member/:id', express.json(), (req, res) => {

    let index= member.findIndex((member) => member.id == req.params.id)
    member[index].Name = req.body.Name
    member[index].Membership = req.body.Membership
    member[index].TrainerId = req.body.TrainerId
    res.status(201).json({message:"updated", member})
  });
 ///////////////////////////////////////////////////
 //5- Delete Member (soft delete)
  app.delete('/member/:id', (req, res) => {
    const memberId = parseInt(req.params.id);
    const members = member.find(m => m.id === memberId);

    if (!members) {
        return res.status(404).send("Member is not found");
    }
    members.isDeleted = true;
    res.status(201).json({message:"soft deleted", members})

});
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //////////////////////////////////////////////Trainer ‘s APIs/////////////////////////////////////////////////////////////////////
 //1- Add a trainer.
 app.post('/trainer',express.json(),(req, res) => {
    let newTrainer= req.body;
    let existTrainer = trainer.find(trainer => trainer.Name == newTrainer.Name)
    if(existTrainer){
        res.json('Trainer is already exist');
    }
    else{
        trainer.push(newTrainer)
        fs.writeFileSync('trainer.json',JSON.stringify(trainer))
        res.json('added')
    }
  })
 /////////////////////////////////////////////
 //2- Get all trainers and trainer’s members.
 app.get('/trainer', (req, res) =>{

    let allTrainers= trainer.map(trainer =>{
        let allMembers= member.find(member => member.TrainerId == trainer.id)
        return {trainer, allMembers}
    })
    res.json(allTrainers)
  })
 ///////////////////////////////////////////
 //3- Update trainer.
 app.put('/trainer/:id', express.json(), (req, res) => {

    let index= trainer.findIndex((trainer) => trainer.id == req.params.id)
    trainer[index].Name = req.body.Name
    trainer[index].Duration = req.body.Duration
    res.status(201).json({message:"updated", trainer})
  });
 //////////////////////////////////////////
 //4- Delete trainer.
 app.delete('/trainer/:id', (req, res) => {

    let index= trainer.findIndex((trainer) => trainer.id == req.params.id)
    trainer.splice(index,1)
    res.status(201).json({message:"deleted", trainer})
  });
 /////////////////////////////////////////
 //5- Get a specific trainer and trainer’s members
 app.get('/getTrainer/:id', (req, res) =>{

        let trainers = trainer.find(trainer => trainer.id == req.params.id)
        let members = member.filter(member => member.TrainerId == req.params.id)
        res.json({trainers, members})
  })
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 app.use('*', (req, res) => {
    res.status(404).json({message:"Route is not found"})
  
  })

 app.listen(3000, () => console.log(`Example app listening`))