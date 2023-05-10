export default function navData(req,res){
  res.json = {...(res.json || {}), path:req.path}
}
