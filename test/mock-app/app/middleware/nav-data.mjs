import {enhanceResponse} from 'enhance-middleware'
export default function navData(req){
  const response = enhanceResponse(req)
  response.addData({path:req.path})
}
