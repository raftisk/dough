# Migration to add recurrence to Transaction and refactor UpcomingTransaction to use inheritance

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


def migrate_upcoming_transactions(apps, schema_editor):
    """
    Migrate existing UpcomingTransaction data to new structure:
    1. Create corresponding Transaction records for each UpcomingTransaction
    2. Link them properly
    """
    UpcomingTransaction = apps.get_model('transactions', 'UpcomingTransaction')
    Transaction = apps.get_model('transactions', 'Transaction')

    # Store old upcoming transaction data
    old_upcoming = list(UpcomingTransaction.objects.all().values(
        'id', 'description', 'amount', 'scheduled_date', 'type',
        'wallet_id', 'category_id', 'is_posted', 'auto_post',
        'is_recurring', 'recurrence_pattern', 'created_at'
    ))

    # Clear the upcoming transactions table (will be recreated with new structure)
    UpcomingTransaction.objects.all().delete()

    return old_upcoming


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0005_recreate_upcoming_transaction'),
    ]

    operations = [
        # Step 1: Add new fields to Transaction model
        migrations.AddField(
            model_name='transaction',
            name='recurrence_pattern',
            field=models.CharField(
                blank=True,
                choices=[
                    ('daily', 'Daily'),
                    ('weekly', 'Weekly'),
                    ('monthly', 'Monthly'),
                    ('yearly', 'Yearly')
                ],
                default=None,
                help_text='Recurrence pattern for recurring transactions',
                max_length=10,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='transaction',
            name='recurrence_end_date',
            field=models.DateField(blank=True, help_text='Date when recurrence should stop', null=True),
        ),

        # Step 2: Store and delete existing upcoming transactions
        migrations.RunPython(
            migrate_upcoming_transactions,
            reverse_code=migrations.RunPython.noop,
        ),

        # Step 3: Delete old UpcomingTransaction model
        migrations.DeleteModel(
            name='UpcomingTransaction',
        ),

        # Step 4: Create new UpcomingTransaction as subclass of Transaction
        migrations.CreateModel(
            name='UpcomingTransaction',
            fields=[
                ('transaction_ptr', models.OneToOneField(
                    auto_created=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    parent_link=True,
                    primary_key=True,
                    serialize=False,
                    to='transactions.transaction'
                )),
                ('auto_post', models.BooleanField(
                    default=False,
                    help_text='If True, automatically convert to Transaction on scheduled date'
                )),
                ('posted_transaction', models.OneToOneField(
                    blank=True,
                    help_text='Reference to the posted Transaction',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='upcoming_source',
                    to='transactions.transaction'
                )),
            ],
            options={
                'ordering': ['date', '-created_at'],
            },
            bases=('transactions.transaction',),
        ),
    ]
