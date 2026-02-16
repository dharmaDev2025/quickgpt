import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
{
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features:['100 text generations','50 image generations']
},
{
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features:['500 text generations','200 image generations']
},
{
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features:['1000 text generations','500 image generations']
}
];


// =================== GET PLANS ===================
export const getPlans = async(req,res)=>{
    res.json({success:true,plans});
};


// =================== PURCHASE ===================
export const purchasePlan = async(req,res)=>{
try{

    const {planId}=req.body;
    const userId=req.user._id;

    const plan=plans.find(p=>p._id===planId);
    if(!plan) return res.json({success:false,message:"Invalid plan"});

    const transaction = await Transaction.create({
        userId,
        planId:plan._id,
        amount:plan.price,
        credits:plan.credits,
        isPaid:false
    });

    const {origin}=req.headers;

    const session=await stripe.checkout.sessions.create({
        payment_method_types:["card"],

        line_items:[{
            price_data:{
                currency:"usd",
                unit_amount:plan.price*100,
                product_data:{name:plan.name}
            },
            quantity:1
        }],

        mode:"payment",

        // ⭐ IMPORTANT: send transactionId to frontend
        success_url:`${origin}/loading?txn=${transaction._id}`,
        cancel_url:`${origin}`

    });

    res.json({success:true,url:session.url});

}catch(err){
    res.json({success:false,message:err.message});
}
};



// =================== VERIFY PAYMENT ===================
export const verifyPayment = async(req,res)=>{

try{

    const {txn}=req.query;

    const transaction = await Transaction.findById(txn);

    if(!transaction)
        return res.json({success:false});

    if(transaction.isPaid)
        return res.json({success:true});

    // ⭐ MARK PAID
    transaction.isPaid=true;
    await transaction.save();

    // ⭐ ADD USER CREDITS
    await User.findByIdAndUpdate(
        transaction.userId,
        {$inc:{credits:transaction.credits}}
    );

    res.json({success:true});

}catch(err){
    res.json({success:false,message:err.message});
}
};
