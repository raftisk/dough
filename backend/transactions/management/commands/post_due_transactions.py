from django.core.management.base import BaseCommand
from django.utils import timezone
from transactions.models import UpcomingTransaction


class Command(BaseCommand):
    help = 'Post all due upcoming transactions with auto_post enabled'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be posted without actually posting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        today = timezone.now().date()

        # Find all due transactions with auto_post enabled that haven't been posted yet
        due_transactions = UpcomingTransaction.objects.filter(
            date__lte=today,
            posted_transaction__isnull=True,
            auto_post=True
        )

        count = due_transactions.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('No due transactions to post.'))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY RUN: Would post {count} transaction(s):'))
            for upcoming in due_transactions:
                self.stdout.write(f'  - {upcoming}')
            return

        # Post each transaction
        posted_count = 0
        recurring_created = 0

        for upcoming in due_transactions:
            try:
                transaction = upcoming.post_now()
                if transaction:
                    posted_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Posted: {transaction}')
                    )

                    # Check if a new recurrence was created (for recurring transactions)
                    if transaction.is_recurring():
                        # Count newly created upcoming transactions
                        new_upcoming = UpcomingTransaction.objects.filter(
                            wallet=transaction.wallet,
                            category=transaction.category,
                            amount=transaction.amount,
                            posted_transaction__isnull=True,
                            recurrence=transaction.recurrence
                        ).exclude(pk=upcoming.pk).order_by('-date').first()

                        if new_upcoming:
                            recurring_created += 1
                            self.stdout.write(
                                self.style.SUCCESS(f'  → Created next recurrence: {new_upcoming}')
                            )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to post {upcoming}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary: Posted {posted_count} transaction(s), '
                f'created {recurring_created} recurring transaction(s).'
            )
        )
