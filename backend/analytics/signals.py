"""
Signal handlers for automatic monthly summary updates.

These signals ensure that monthly summaries are updated whenever transactions
are created, modified, or deleted. This keeps the cached summaries in sync
with the actual transaction data.
"""

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver

from analytics.services.summary import update_monthly_summary


@receiver(pre_save, sender='transactions.Transaction')
def store_original_transaction_date(sender, instance, **kwargs):
    """
    Store the original transaction date before updating.

    This allows us to detect date changes in post_save and update
    both the old and new months' summaries.
    """
    if instance.pk:  # Only for existing transactions (updates)
        try:
            original = sender.objects.get(pk=instance.pk)
            instance._original_date = original.date
        except sender.DoesNotExist:
            instance._original_date = None
    else:
        instance._original_date = None


@receiver(post_save, sender='transactions.Transaction')
def update_summary_on_transaction_save(sender, instance, created, **kwargs):
    """
    Update monthly summary when a transaction is created or updated.

    For new transactions: update the month they belong to
    For updated transactions: update both old and new months if date changed
    """
    # Get user from transaction's wallet
    user = instance.wallet.user
    year = instance.date.year
    month = instance.date.month

    # Update the summary for the new/current month
    update_monthly_summary(user, year, month)

    # If this was an update and the date changed, also update the old month
    if not created and hasattr(instance, '_original_date') and instance._original_date:
        old_date = instance._original_date
        if old_date != instance.date:
            # Date changed - update the old month too
            old_year = old_date.year
            old_month = old_date.month
            if (old_year != year) or (old_month != month):
                update_monthly_summary(user, old_year, old_month)


@receiver(post_delete, sender='transactions.Transaction')
def update_summary_on_transaction_delete(sender, instance, **kwargs):
    """
    Update monthly summary when a transaction is deleted.

    Recalculates the summary for the month the transaction belonged to.
    """
    # Get user from transaction's wallet
    user = instance.wallet.user
    year = instance.date.year
    month = instance.date.month

    # Update the summary (will recalculate without the deleted transaction)
    update_monthly_summary(user, year, month)
