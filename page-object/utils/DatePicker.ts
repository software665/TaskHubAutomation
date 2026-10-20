
import { Page, expect } from '@playwright/test';

export class DatePicker {
    constructor(private page: Page) {}

    async selectDueDate(
        dateLocator:string,
        date: string ,
        hour: string ,
        minute: string,
        period: 'AM' | 'PM' = 'AM'
    ): Promise<void> {

        // Open date picker
        await this.page.locator(dateLocator).click();

        const calendar = this.page.getByRole('dialog', {
            name: 'Choose date and time'
        });

        await expect(calendar).toBeVisible();

        // Get current date or custom date
        const today = new Date();

        const selectedDate = date.toLowerCase() === 'today'
            ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            : date;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
            throw new Error('Date must be YYYY-MM-DD or today');
        }

        const [year, month] = selectedDate.split('-').map(Number);

        // Navigate to required month
        const monthLabel = calendar.locator('[aria-live="polite"]');

        let monthFound = false;

        for (let i = 0; i < 120; i++) {

            const displayedMonth = (await monthLabel.innerText()).trim();
            const currentMonth = new Date(`${displayedMonth} 1`);

            const difference =
                (year - currentMonth.getFullYear()) * 12 +
                (month - 1 - currentMonth.getMonth());

            if (difference === 0) {
                monthFound = true;
                break;
            }

            await calendar.getByRole('button', {
                name: difference > 0 ? 'Next month' : 'Previous month'
            }).click();
        }

        if (!monthFound) {
            throw new Error(`Unable to navigate to ${selectedDate}`);
        }

        // Select date
        const dayButton = calendar.locator(
            `button[data-day="${selectedDate}"]`
        );

        await expect(dayButton).toBeVisible();
        await expect(dayButton).not.toHaveAttribute(
            'aria-disabled',
            'true'
        );

        await dayButton.click();

        // Validate time
        const hh = Number(hour);
        const mm = Number(minute);

        if (
            !Number.isInteger(hh) ||
            !Number.isInteger(mm) ||
            hh < 1 || hh > 12 ||
            mm < 0 || mm > 59
        ) {
            throw new Error('Invalid time. Hour: 1-12, Minute: 0-59');
        }

        // Fill hour and minute
        await calendar.getByRole('textbox', {
            name: 'Hour'
        }).fill(String(hh).padStart(2, '0'));

        await calendar.getByRole('textbox', {
            name: 'Minute'
        }).fill(String(mm).padStart(2, '0'));

        // Select AM or PM
        const periodButton = calendar
            .getByRole('group', { name: 'AM or PM' })
            .getByRole('button', { name: period, exact: true });

        await periodButton.click();

        await expect(periodButton).toHaveAttribute(
            'aria-pressed',
            'true'
        );

        // Apply
        const applyButton = calendar.getByRole('button', {
            name: 'Apply'
        });

        await expect(applyButton).toBeEnabled();
        await applyButton.click();

        await expect(calendar).toBeHidden();

        console.log(
            `Due Date Selected: ${selectedDate} ${hour}:${minute} ${period}`
        );
    }
}
