import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import emojiIcon from '../theme/icons/emoji.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import EmojiListView from './ui/emojilistview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import addoil from '../theme/icons/wxemoji/addoil.svg';
import cold from '../theme/icons/wxemoji/cold.svg';
import i_2_02 from '../theme/icons/wxemoji/i_2_02.svg';
import i_2_04 from '../theme/icons/wxemoji/i_2_04.svg';
import i_2_05 from '../theme/icons/wxemoji/i_2_05.svg';
import i_2_06 from '../theme/icons/wxemoji/i_2_06.svg';
import i_2_07 from '../theme/icons/wxemoji/i_2_07.svg';
import i_2_09 from '../theme/icons/wxemoji/i_2_09.svg';
import i_2_11 from '../theme/icons/wxemoji/i_2_11.svg';
import i_2_12 from '../theme/icons/wxemoji/i_2_12.svg';

import keep_fighting from '../theme/icons/wxemoji/keep_fighting.svg';
import no_prob from '../theme/icons/wxemoji/no_prob.svg';
import shocked from '../theme/icons/wxemoji/shocked.svg';
import slap from '../theme/icons/wxemoji/slap.svg';
import social from '../theme/icons/wxemoji/social.svg';
import sweats from '../theme/icons/wxemoji/sweats.svg';
import watermelon from '../theme/icons/wxemoji/watermelon.svg';
import wow from '../theme/icons/wxemoji/wow.svg';
import yellowdog from '../theme/icons/wxemoji/yellowdog.svg';

export default class Emoji extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Emoji';
	}

	init() {
		const editor = this.editor;

		editor.editing.view.addObserver( ClickObserver );

		editor.config.define( 'emojiSmileyIcon', emojiIcon );

		editor.config.define( 'emoji', [
			{ name: '奸笑', type: 'image', text: '[奸笑]', icon: i_2_02 },
			{ name: '嘿哈', type: 'image', text: '[嘿哈]', icon: i_2_04 },
			{ name: '捂脸', type: 'image', text: '[捂脸]', icon: i_2_05 },
			{ name: '机智', type: 'image', text: '[机智]', icon: i_2_06 },
			{ name: '茶', type: 'image', text: '[茶]', icon: i_2_07 },
			{ name: '红包', type: 'image', text: '[红包]', icon: i_2_09 },
			{ name: '耶', type: 'image', text: '[耶]', icon: i_2_11 },
			{ name: '皱眉', type: 'image', text: '[皱眉]', icon: i_2_12 },
			{ name: '吃瓜', type: 'image', text: '[吃瓜]', icon: watermelon },
			{ name: '加油', type: 'image', text: '[加油]', icon: addoil },
			{ name: '汗', type: 'image', text: '[汗]', icon: sweats },
			{ name: '天啊', type: 'image', text: '[天啊]', icon: shocked },
			{ name: 'Emm', type: 'image', text: '[Emm]', icon: cold },
			{ name: '社会社会', type: 'image', text: '[社会社会]', icon: social },
			{ name: '旺柴', type: 'image', text: '[旺柴]', icon: yellowdog },
			{ name: '好的', type: 'image', text: '[好的]', icon: no_prob },
			{ name: '打脸', type: 'image', text: '[打脸]', icon: slap },
			{ name: '加油加油', type: 'image', text: '[加油加油]', icon: keep_fighting },
			{ name: '哇', type: 'image', text: '[哇]', icon: wow },
			{ name: '奸笑', type: 'image', text: '[奸笑]', icon: addoil },
			{ name: '奸笑', type: 'image', text: '[奸笑]', icon: addoil },
			{ name: 'smile', text: '😄' },
			{ name: '😷', text: '😷' },
			{ name: '😂', text: '😂' },
			{ name: '😝', text: '😝' },
			{ name: '😳', text: '😳' },
			{ name: '😱', text: '😱' },
			{ name: '😔', text: '😔' },
			{ name: '😒', text: '😒' },
		] );

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * The form view displayed inside the balloon.
		 *
		 * @member {module:emoji/ui/emojilistview~EmojiListView}
		 */
		this.formView = this._createForm();

		editor.ui.componentFactory.add( 'emoji', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = editor.t( 'Emoji' );
			button.icon = editor.config.get( 'emojiSmileyIcon' );
			button.tooltip = true;

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => this._showPanel( true ) );

			this._button = button;

			return button;
		} );

		this._attachActions();
	}

	/**
	 * Creates the {@link module:emoji/ui/emojilistview~EmojiListView} instance.
	 *
	 * @private
	 * @returns {module:emoji/ui/emojilistview~EmojiListView} The emoji list view instance.
	 */
	_createForm() {
		const editor = this.editor;
		const emojiView = new EmojiListView( editor );

		editor.config.get( 'emoji' ).forEach( emoji => {
			this.listenTo( emojiView, 'emoji:' + emoji.name, () => {
				editor.model.change( writer => {
					writer.insertText(
						emoji.text,
						editor.model.document.selection.getFirstPosition()
					);
					this._hidePanel();
				} );
			} );
		} );

		// Close the panel on esc key press when the form has focus.
		emojiView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hidePanel( true );
			cancel();
		} );

		return emojiView;
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */
	_showPanel() {
		const target = this._button.element;
		this._balloon.add( {
			withArrow: false,
			view: this.formView,
			balloonClassName: 'emoji-balloon-panel',
			position: {
				target,
				limiter: target
			}
		} );
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 *
	 * @private
	 */
	_attachActions() {
		// Focus the form if the balloon is visible and the Tab key has been pressed.
		this.editor.keystrokes.set(
			'Tab',
			( data, cancel ) => {
				if (
					this._balloon.visibleView === this.formView &&
					!this.formView.focusTracker.isFocused
				) {
					this.formView.focus();
					cancel();
				}
			},
			{
				// Use the high priority because the emoji UI navigation is more important
				// than other feature's actions, e.g. list indentation.
				// https://github.com/ckeditor/ckeditor5-link/issues/146
				priority: 'high'
			}
		);

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView ) {
				this._hidePanel();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView,
			activator: () => this._balloon.hasView( this.formView ),
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hidePanel()
		} );
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_showPanel}.
	 *
	 * @protected
	 * @param {Boolean} [focusEditable=false] When `true`, editable focus will be restored on panel hide.
	 */
	_hidePanel( focusEditable ) {
		this.stopListening( this.editor.editing.view, 'render' );

		if ( !this._balloon.hasView( this.formView ) ) {
			return;
		}

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}

		this.stopListening( this.editor.editing.view, 'render' );
		this._balloon.remove( this.formView );
	}
}
