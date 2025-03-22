export const registerFormConstants = {
    formTitle: 'Register',
    saveBtnTitle: 'Register',
    resetBtnTitle: 'Reset',
    formControls:[
        {
        "name":"firstName",
        "label":"First Name",
        "value":"",
        "placeholder":"",
        "class":"col-md-6",
        "type":"text",
        "validators":[
            {
                validatorName: 'required',
                "required":true,
                "message":"First Name is required"
            }
        ]
    },
    
        
]
};