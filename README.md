# JavaMedTestGen
Purpose: To create a test generator for the medical students. In addition to the teacher being able to create the tests should also be able to send these tests out to students and then grade the submissions. Once evaluated feed back and additional information will be provided back to the student. 

Teacher Side: This will be the meat of the application as the teacher will be able to do many more things than the student. There are several forms contained within the teacher folder.

Send.html - This form is where the teacher will administer the tests to students. It should be made up of two sections. One section should be filled by the students that are in his class and logged into the student side. The other should be filled with the test that he has created. Both  The tests shoudl be all held in a file on the teachers computer. There should be three buttons on this page. One to return to menu. Send - Which will send out a specific test to specific students and Broadcast - Which will send a specific test to all available students. 

Teacher.html - This form is the test creation form. It contains all of the fields that a test might have. These are to be filled in by the teacher. There is the usual back to menu button and then a save button. The save button should take all of the input fields and package them into a file. These files will be used to autofill the student end when they recieve the test.  All test files should be kept in a folder on the teachers computer. 

Menu.html - The basic menu for the teacher. This is pretty much just a menu of redirection. To make a test we have the create button. This button redirects to Teacher.html. The Send button will redirect to Send.html. Additionally we have the View submissions button. This will redirect to its own form.

//TODO:
View submissions - This is where the grading is done. Here is where he will monitor the students tests. When a student finishes thier response and submits it, a notification should come up on the teacher end of the application. In View he should then see the submissions, the student who submitted it, and the test. Then either be able to open them to view then grade, or you may display thier answers right there. However you decide to do it. The teacher should be able to grade an assesment. This in turn will determine what the student is then allowed to see (be it the appropriate or inappropriate treatment information).

Student side: This is what the student will see when they are taking the test. When they start, it should automaticcaly be identified as a student via responding to the pokes being sent out. They will need a log in of some kind to at least identify them. Their name at least so the teacher knows who is getting the test. A password is optional.
