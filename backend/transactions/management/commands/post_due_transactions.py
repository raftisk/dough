from django.core.management.base import BaseCommand
from django.utils import timezone
from transactions.models import UpcomingTransaction


class Command(BaseCommand):
    help = 'Post upcoming transactions that are due and have auto_post enabled'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be posted without actually posting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        today = timezone.now().date()

        # Find due transactions with auto_post enabled
        due_transactions = UpcomingTransaction.objects.filter(
            date__lte=today,
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

        for upcoming in due_transactions:
            try:
                transaction = upcoming.post_transaction()
                self.stdout.write(
                    self.style.SUCCESS(f'Posted: {transaction.description} - {transaction.amount} on {transaction.date}')
                )
                posted_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to post {upcoming.description}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully posted {posted_count} transaction(s)')
        )
