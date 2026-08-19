 Team Charter
1. Team 6

Team name: Team 6

| Member | Starting role |
|---|---|
| [Daniella Muita] | [Integration/QA Lead] |
| [Ryan Njuguna] | [API Lead] |
| [Jasmine Kilemi] | [Docs/DevOps Lead] |
| [Charlene Kitur] | [Backend Dev(s)] |

 2. Existing Application

MoneyMentor Kenya is a financial-literacy web application designed primarily for young adults in Kenya. It provides educational content and interactive tools for budgeting, saving and investing. Users can calculate a suggested monthly budget using the 50/30/20 rule, estimate how long it will take to reach a savings goal, project potential investment returns, read financial tips and frequently asked questions, print a budget, and download budget and expense-tracking resources. The current application is frontend-only and does not have user accounts, a backend or permanent database storage.

 3. Part B Audit

The existing application does not currently use a database. Calculator inputs and results are stored temporarily in browser memory and are cleared when the page is refreshed or closed.

 Budget resource

Stored temporarily:

- Monthly income
- Fixed expenses
- Variable expenses
- Total expenses
- Suggested needs allocation
- Suggested wants allocation
- Suggested savings or debt allocation
- Remaining surplus or deficit
- Overspending status

Available actions:

- Enter income
- Enter fixed expenses
- Enter variable expenses
- Calculate a budget
- View suggested allocations
- View a surplus or deficit
- Print the calculated budget

Savings-goal resource

Stored temporarily:

- Goal amount
- Monthly savings amount
- Estimated number of months
- Estimated years and remaining months
- Projected total saved
- Calculated progress percentage

Available actions:

- Enter a savings target
- Enter a monthly contribution
- Calculate the expected timeline
- View the projected completion period
- View projected total savings
- View the progress indicator

Investment-calculation resource

Stored temporarily:

- Initial investment
- Monthly contribution
- Annual interest rate
- Investment period
- Total amount invested
- Estimated future value
- Estimated earnings
- Estimated return on investment

Available actions:

- Enter investment assumptions
- Calculate projected returns
- View total contributions
- View estimated future value
- View estimated earnings
- View estimated return on investment

The investment calculator produces educational projections only. It does not make investments or transfer money.

Contact-message resource

Stored temporarily:

- Name
- Email address
- Question
- Validation errors
- Form-submission status

Available actions:

- Enter a name
- Enter an email address
- Enter a question
- Validate required fields
- Validate basic email formatting
- Display a submission-success screen
- Clear the form and start another message

The current contact form does not send or permanently store messages because no backend or API is connected.

 Preference and interface resources

Stored temporarily:

- Dark-mode selection
- Mobile-menu state
- Currently expanded FAQ
- Toast notification
- Current device time

Available actions:

- Enable or disable dark mode
- Open or close the mobile menu
- Navigate between page sections
- Expand or collapse FAQs
- View temporary success and error notifications
- View the current device time

Learning and download resources

Application resources:

- Financial-learning cards
- Financial tips
- Frequently asked questions
- Excel monthly-budget template
- PDF expense tracker

Available actions:

- Read educational content
- Open and close FAQ answers
- Download the Excel budget template
- Download the PDF expense tracker
- Open, edit or save the Excel workbook
- Open, save or print the PDF tracker

Quiz resource

Available action:

- Click the quiz button and view a result

The current quiz is a demonstration. It does not ask questions and always displays the same hard-coded result.

Data not collected

The current application does not collect or store:

- Passwords
- Bank-account details
- Card information
- M-Pesa credentials or PINs
- Payment transactions
- Location
- Contacts
- Camera or microphone data
- Uploaded files
- Analytics data
- Advertising identifiers
- Cookies
- Browser local storage
- User accounts

4. Ring Position

We will consume from: [Team 5]

Our work will be consumed by: [Team 7]