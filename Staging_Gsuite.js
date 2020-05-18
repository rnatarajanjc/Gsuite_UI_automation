//This test needs pre-existing Gsuite directory created as 'G Suite'
import axios from 'axios';
import * as cypressEnv from '../../cypress.env.json';
import * as cypressJson from '../../cypress.json';

var directoryresponse;
var directoryafterreactivate;
var directoryresponseafterdeletion;
var gsuiteid;
var Editedgsuitename;

//Logging into Local Host in Admin Portal
describe('Log into the Host',function()
 {
     it ('Log into the Host', function()
     {
         cy.visit(`${cypressJson.baseUrl}/login}`)
         cy.contains('Administrator Login').click();
         cy.contains('JumpCloud Administrator Login');
         cy.wait(500);
         cy.get('input[name=email]').type(cypressEnv['adminUserName']);
         cy.get('input[name=password]').type(cypressEnv['adminPassword']);
         cy.get('button[type=submit]').click();
         //cy.get('button[type=button]').click();
         cy.get('.MdmLaunchModal__buttonContainer > .btnDefault').click();
         cy.get('.CloseButton__closeButtonImg').click();
     })
     
})


//Click  Directories Page 
describe('Gsuite Aside', function()
{
//Run a GET on directories and validate the Gsuite directory presence
    it ('Click directories and do a API call v2/directories', function()
    {
       cy.contains('Directories').click();   
       cy.request({
        method: 'GET', url: `${cypressJson.baseUrl}/api/v2/directories`, 
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': `${cypressEnv.apiKey}`,
        },
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.not.be.null
          directoryresponse = response.body
          for (let val of directoryresponse){ 
            console.log(val.name);
            if (val.name=='G Suite'){
                  gsuiteid=(val.id);  
                console.log(gsuiteid);
            }
        }
        })
       
    })

    it ('Create New User', function()
    {
      //cy.get('.jc-users-fg').click()
      //cy.get('.CloseButton__closeButtonImg > g > path').click()
      cy.get('[data-walkthrough="nav-link-Users"] > div > .NavPanelLink__navLink').click()
      cy.get('.jc-actions-add')
      cy.request({
        method: 'POST', url: `${cypressJson.baseUrl}/api/systemusers`, 
        body: { username:'Gsuiteuser',
                email:'cypressuser@thejumpcloud.com',
                firstname:'cypress',
                lastname:'user',
                password:'test'},
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': `${cypressEnv.apiKey}`,
        },
        }).then((response) => {expect(response.status).to.eq(200)})
        cy.wait(500);
        cy.get('.ItemTableSearchBar__searchInput').type('cypress') 
        cy.get('.ItemName__title').should('contain','cypress user')
        cy.get('.ItemTable__dataFieldText').should('contain','cypressuser@thejumpcloud.com')

    })

    it ('Create New UserGroup', function()
    {
      cy.get('[data-walkthrough="nav-link-Groups"] > [data-v-0a6adf88=""] > .NavPanelLink__navLink').click()
      cy.request({
        method: 'POST', url: `${cypressJson.baseUrl}/api/v2/usergroups`, 
        body: { name:'cypressGsuitegroup'},                
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': `${cypressEnv.apiKey}`,
        },
        }).then((response) => {expect(response.status).to.eq(201)}) 
        cy.get('.ItemTableSearchBar__searchInput').type('cypressGsuitegroup')
        cy.get('.ItemName__title').should('contain','cypressGsuitegroup')
        cy.get('.ItemName__subtitle').should('contain','Group of Users')
        cy.wait(500);
        cy.get(':nth-child(1) > :nth-child(3) > .ItemName__container').click()
        cy.get('[data-name="user"] > span').click()
        cy.get('.active > .itemTableContainerInDetailsAsidePanel > .ItemTable__containerInAsidePanel > .ItemTable__container > .ItemTableActionBar__actionBar > .ItemTableActionBar__actionsContainer > .ItemTableActionBar__actionsContent > .ItemTableActionBar__searchBar > .ItemTableSearchBar__searchContainer > .ItemTableSearchBar__searchForm > .ItemTableSearchBar__searchInput').type(('cypressuser@thejumpcloud.com'))
        cy.wait(500);
        cy.get('.active > .itemTableContainerInDetailsAsidePanel > .ItemTable__containerInAsidePanel > .ItemTable__container > .ItemTable__tableContainer > .ItemTable__table > tbody > .ItemTable__tableBodyRow > .ItemTable__selectColumn > .ItemTable__rowCheckboxContainer > .ItemTable__rowCheckbox').click()
        cy.get('.btn').click()
        //cy.get('[data-walkthrough="aside-panel-save-button"]').click()
        cy.visit(`${cypressJson.baseUrl}/#/groups}`) 
        cy.get('.FlatActionButton__text').click()  
    })

    //Edit Gsuite name
    it ('Edit Gsuite name using PATCH API call', function()
    {
        cy.contains('Directories').click();   
        cy.request({
         method: 'PATCH', url: `${cypressJson.baseUrl}/api/v2/gsuites/${gsuiteid}`, 
         body: { name: 'Test Org' },
        headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': `${cypressEnv.apiKey}`,
        },
        }).then((response) => {
            expect(response.status).to.eq(200)
            console.log(gsuiteid)
            console.log(name)
            Editedgsuitename = response.body
            gsuiteid = response.body
            console.log(gsuiteid)
            console.log(name)
            expect(Editedgsuitename).to.have.property('name')
            return { 'id': gsuiteid, 'name': Editedgsuitename }
        })
   
    })

    it ('Verify the Edited Gsuite name', function()
    {
      cy.contains('Directories').click();  
      cy.reload()
      cy.get('.CloseButton__closeButtonImg')
      cy.get('.ItemTable__table').should('contain', 'Test Org');
      cy.get('.DirectoryItemTable__nameColumn > .ItemName__container > .ItemName__title').should('contain', 'Test Org')
      cy.get('.DirectoryItemTable__nameColumn > .ItemName__container > .ItemName__subtitle').should('contain','G Suite');
      //cy.get('span[title="Test Org"]').click();
      cy.wait(500);  
      
    })   
    it ('Verify the Gsuite aside', function()
    {
        cy.reload()
        cy.get('.btnDefault').click()
        cy.get('span[title="Test Org"]').click();
        cy.get('[fill="#82bc00"]')
        cy.get('.EditableInputWithIcon__editIcon').click();
        cy.get('.EditableInputWithIcon__cancelText').click();
        cy.get('.DirectorySync__reactivateButton > .FlatActionButton__content').should('not.be.disabled')
        cy.get('.DirectoryImport__sectionContent > .btnDefault > .FlatActionButton__content').should('not.be.disabled')
        cy.get('.ModalFooter__modalFooter > .btnDefault > .FlatActionButton__content > :nth-child(1) > .FlatActionButton__text').should('not.be.disabled')
        cy.get('.AsidePanel__actionSave > .btnDefault').click()
    }) 
    
    it ('Bind new Usergroup and User to the Edited Gsuite name and verify the bound User', function()
    {
        
        //cy.reload()
        
        //cy.get('.btnDefault').click();
        cy.get('.CloseButton__closeButtonImg > g > path').click()
        cy.wait(500);
        cy.get('span[title="Test Org"]').filter('span[class="ItemName__title"]').click();
        //cy.get('tbody > :nth-child(3) > :nth-child(3)').click()
        cy.wait(500);
        cy.get(':nth-child(2) > .AsidePanel__bodyNavItemLink > .AsidePanel__bodyNavItemLinkLabel').click();
        cy.get('.ItemTableSearchBar__searchInput').type('cypressGsuitegroup')
        cy.get('.ItemTable__tableBodyRow > .ItemTable__selectColumn > .ItemTable__rowCheckboxContainer > .ItemTable__rowCheckbox').click();
        cy.get('.AsidePanel__actionSave > .btnDefault').click();
        //cy.get('.btnDefault').click();
        //cy.get('.CloseButton__closeButtonImg > g > path').click();
        cy.wait(500);
        cy.get('span[title="Test Org"]').filter('span[class="ItemName__title"]').click();
        cy.get(':nth-child(3) > .AsidePanel__bodyNavItemLink > .AsidePanel__bodyNavItemLinkLabel').click();
        cy.get('.ItemTableSearchBar__searchInput').type('cypressuser@thejumpcloud.com')
        cy.get('.ItemTable__tableBodyRow > .ItemTable__selectColumn > .ItemTable__rowCheckboxContainer > .ItemTable__rowCheckbox').click()
        cy.get('.ItemTableActionBar__selectionBoundItemsInput').click();
        cy.get('.AsidePanel__actionSave > .btnDefault').click()
        //cy.get('.AsidePanel__closeButton > .jc-actions-add').click();
        //cy.get('.AsidePanel__actionLink').click()       
        
    })

    it ('Validate the Muliple GSuite Modal', function()
    {
        cy.get('.btnMainAction > .jc-actions-add').click()
        //cy.get('.jc-directories-fg').click()
        cy.wait(500);
        cy.get('.btnMainAction > .jc-actions-add').click()
        //cy.get('.jc-actions-add').click()
        //cy.get('.ItemTableActionBar__actionBar > :nth-child(1) > .DropDownList__dropDownMenuList > :nth-child(1) > .DropDownList__menuItemsContainer > :nth-child(2) > .DropDownList__menuItem > .DropDownList__menuItemLabel').click()
        cy.get('.itemTableContainer > :nth-child(1) > .ItemTable__container > .ItemTableActionBar__actionBar > :nth-child(1) > .DropDownList__dropDownMenuList > :nth-child(1) > .DropDownList__menuItemsContainer > :nth-child(2) > .DropDownList__menuItem').click()
        cy.get('.ModalHeader__headerText').should('contain','Set Up a New G Suite Directory')
        cy.get('.ModalFooter__cancelLink').should('not.be.disabled');
        cy.get('.btnDefault').should('be.disabled');
        cy.get('.Input__input').type('Gsuite for TestOrg')
        cy.get('.btnDefault').should('not.be.disabled')
        cy.get('.ModalHeader__closeIconContainer > .jc-actions-add').click()

    })


    //Deactivate Gsuite
    it (' Deactivate Gsuite',function()
    {
        //cy.get('.CloseButton__closeButtonImg > g > path').click();
        cy.get('span[title="Test Org"]').filter('span[class="ItemName__title"]').click();
        cy.get('.btnAlert > .FlatActionButton__content').should('not.be.disabled')
        cy.get('.ModalFooter__modalFooter > .btnDefault > .FlatActionButton__content > :nth-child(1) > .FlatActionButton__text').should('not.be.disabled')
        cy.get('.ModalFooter__cancelLink').should('not.be.disabled')
        cy.get('.FlatActionButton__text').should('not.be.disabled')
        cy.get('.btnAlert > .FlatActionButton__content').click()
        cy.get('.ModalHeader__headerText').should('contain','Deactivate G Suite Synchronization')
        cy.get('.ModalFooter__modalFooter > .btnDefault > .FlatActionButton__content > :nth-child(1) > .FlatActionButton__text').click()
        
    })   
    
   //Verify the Gsuite is deleted from Directories main page
    it ('Click directories and verify Gsuite is deleted', function()
    {
       //cy.wait(500); 
       //cy.reload();
       //cy.get('.jc-directories-fg').click();
       cy.request({
        method: 'GET', url: 'http://localhost/api/v2/directories', 
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': 'c8b96d60dd21e29a4a16de5a6f5673e00cabe8f0',
        },
        }).then((respond) => {
          expect(respond.status).to.eq(200)
          expect(respond.body).to.not.be.null
            directoryresponseafterdeletion = respond.body
            console.log(directoryresponseafterdeletion)
            //expect(directoryresponseafterdeletion).to.not.have.members(['id','type', 'name'])
            
        })
            
    }) 

    //Delete the UserGroup and User
  it ('Delete Usergroup ', function()
  {
      //cy.get('.jc-tags-fg').click()
      cy.get('[data-walkthrough="nav-link-Groups"] > [data-v-0a6adf88=""] > .NavPanelLink__navLink').click()
      cy.get('.ItemTableSearchBar__searchInput').type('cypressGsuitegroup').should("have.value", 'cypressGsuitegroup')
      cy.wait(500);
      cy.get('.ItemName__title').should('contain','cypressGsuitegroup')
      cy.get('.ItemName__subtitle').should('contain','Group of Users')
      cy.get('.ItemTable__tableBodyRow > .ItemTable__selectColumn > .ItemTable__rowCheckboxContainer').click()
      cy.get('.ItemTableActionBar__bulkActions > .btnAlert').click()
      cy.get('.ModalFooter__modalFooter > .btnDefault').click()
  })

 it ('Delete User ', function()
  {
      //cy.get('.jc-users-fg').click()
      cy.get('[data-walkthrough="nav-link-Users"] > div > .NavPanelLink__navLink').click()
      cy.get('.ItemTableSearchBar__searchInput').type('cypressuser@thejumpcloud.com') 
      cy.get('.ItemTable__tableBodyRow > .ItemTable__selectColumn > .ItemTable__rowCheckboxContainer').click()
      cy.get('.ItemName__title').should('contain','cypress user')
      cy.get('.ItemName__subtitle').should('contain','Gsuiteuser')
      cy.get('.ItemTableActionBar__bulkActions > .btnAlert').click()
      cy.get('.Input__input').type('1')
      cy.get('.ModalFooter__modalFooter > .btnDefault').click()
      
  })      

  it ('Logout from the Host', function()
  {
    cy.get('.AccountDetailsDropdown__dropDownToggle > .jc-caret-down').click()
    cy.get('.AccountDetailsDropdown__dropDown > .DropDownList__dropDownMenuList > :nth-child(1) > .DropDownList__menuItemsContainer > :nth-child(9) > .DropDownList__menuItem > .DropDownList__menuItemLabel').click()  
  }) 
    

})    
